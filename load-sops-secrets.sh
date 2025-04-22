#!/bin/bash
set -euo pipefail

export SOPS_AGE_KEY_FILE="/home/ken/.config/sops/age/keys.txt"
SECRETS_FILE="/docker/secrets.yaml"
SECRETS_DIR="/run/secrets"

# Get the git repo root directory
# If the script returns an empty value for $REPO_ROOT, you may have to run:
# sudo git config --system --add safe.directory <PathToFolder>
REPO_ROOT=$(git -C "$(dirname "$SECRETS_FILE")" rev-parse --show-toplevel 2>/dev/null || echo "")
if [[ -z "$REPO_ROOT" ]]; then
  echo "❌ $REPO_ROOT is not a Git repository. Cannot update .gitignore relative paths."
  exit 1
fi

GITIGNORE_FILE="$REPO_ROOT/.gitignore"
mkdir -p "$SECRETS_DIR"
touch "$GITIGNORE_FILE"

# Clear existing env-vars (if any)
rm -f "$SECRETS_DIR"/*

echo "[1/2] Decrypting $SECRETS_FILE..."
DECRYPTED=$(sops -d "$SECRETS_FILE")

echo "[2/2] Processing secrets..."
echo "$DECRYPTED" | yq -o=json '.' | jq -r 'to_entries[] | @base64' | while read -r entry; do
  _jq() {
    echo "$entry" | base64 --decode | jq -r "$1"
  }

  key=$(_jq '.key')
  value=$(_jq '.value')

  if [[ "$key" == /* ]]; then
    echo " - Writing secret file to: $key"
    mkdir -p "$(dirname "$key")"
    printf "%s" "$value" > "$key"
    chmod 644 "$key"

    # Compute relative path for gitignore
    relpath=$(realpath --relative-to="$REPO_ROOT" "$key")
    if ! grep -Fxq "$relpath" "$GITIGNORE_FILE"; then
      echo "   ➕ Adding $relpath to $GITIGNORE_FILE"
      echo "$relpath" >> "$GITIGNORE_FILE"
    fi
  else
    if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      filepath="$SECRETS_DIR/$key"
      echo " - Adding $key to $filepath"
      echo -n "$value" > "$filepath"
      chmod 600 "$filepath"
    else
      echo " ⚠️  Skipping invalid env var name: $key"
    fi
  fi
done

echo "✅ Secrets loaded and .gitignore updated with relative paths."

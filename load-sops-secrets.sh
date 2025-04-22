#!/bin/bash
set -euo pipefail

export SOPS_AGE_KEY_FILE="/home/ken/.config/sops/age/keys.txt"
SECRETS_FILE="/docker/secrets.yaml"
SECRETS_DIR="/run/secrets"

mkdir -p "$SECRETS_DIR"

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
    chmod 600 "$key"
  else
    if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      echo " - Adding $key to $SECRETS_DIR"
      echo -n "$value" > "$SECRETS_DIR/$key"
      chmod 600 "$SECRETS_DIR/$key"
    else
      echo " ⚠️  Skipping invalid env var name: $key"
    fi
  fi
done

echo "✅ Secrets loaded successfully."

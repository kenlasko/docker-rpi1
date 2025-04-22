#!/bin/bash
set -euo pipefail

echo "[1/3] Creating sops-secrets.service..."

cat <<EOF | sudo tee /etc/systemd/system/sops-secrets.service > /dev/null
[Unit]
Description=Load SOPS secrets into /run/secrets
After=network.target

[Service]
Type=oneshot
ExecStart=/docker/load-sops-secrets.sh
Environment="SOPS_AGE_KEY_FILE=/home/ken/.config/sops/age/keys.txt"
StandardOutput=journal
StandardError=journal
EOF

echo "[2/3] Creating sops-secrets.path..."

cat <<EOF | sudo tee /etc/systemd/system/sops-secrets.path > /dev/null
[Unit]
Description=Watch SOPS secrets.yaml for changes

[Path]
PathChanged=/docker/secrets.yaml

[Install]
WantedBy=multi-user.target
EOF

echo "[3/3] Enabling and starting watcher..."
sudo systemctl daemon-reload
sudo systemctl enable --now sops-secrets.path

echo "✅ SOPS watcher installed and active. Try editing /docker/secrets.yaml to test it."

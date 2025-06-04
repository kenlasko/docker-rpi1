#!/bin/bash

# This script sets up a systemd service and timer on a Raspberry Pi to automatically update and redeploy
# a Docker Compose stack located in /docker. It works by periodically checking the GitHub repository
# for changes using `git fetch`, and if updates are found, it pulls the latest changes and runs
# `docker compose pull` and `docker compose up -d` to apply them.
#
# The service runs every 5 minutes and also triggers once shortly after boot. This is ideal for environments
# where updates are managed via automation tools like Renovate and you want the Pi to keep itself in sync.


set -e

USER=ken
DOCKER_DIR="/docker"
UPDATE_SCRIPT="$DOCKER_DIR/update-docker.sh"
SERVICE_FILE="/etc/systemd/system/docker-auto-update.service"
TIMER_FILE="/etc/systemd/system/docker-auto-update.timer"

echo "📦 Creating Docker update script at $UPDATE_SCRIPT..."
mkdir -p "$DOCKER_DIR"
cat > "$UPDATE_SCRIPT" <<'EOF'
#!/bin/bash
set -e
cd /docker

# Fetch remote changes
echo "Fetching remote changes..."
if ! timeout 30s git fetch origin; then
  echo "git fetch timed out or failed."
  exit 1
fi

# Check if anything actually changed
echo "Checking for changes..."
if ! git diff --quiet HEAD origin/main; then
  echo "Changes detected, pulling and redeploying..."
  git pull origin main
  docker compose pull
  docker compose up -d
else
  echo "No changes, skipping update."
fi
EOF

chmod +x "$UPDATE_SCRIPT"

echo "🛠️ Creating systemd service..."
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Update Docker Compose on Git Pull
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
User=$USER
WorkingDirectory=$DOCKER_DIR
ExecStart=$UPDATE_SCRIPT
EOF

echo "⏱️ Creating systemd timer..."
sudo tee "$TIMER_FILE" > /dev/null <<EOF
[Unit]
Description=Run Docker Auto-Update every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF

echo "🔄 Reloading systemd and enabling timer..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now docker-auto-update.timer

echo "✅ Docker auto-update system is now active!"
systemctl list-timers | grep docker-auto-update

echo "🔄 Reloading systemd and enabling timer..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now docker-auto-update.timer

echo "✅ Docker auto-update system is now active!"
sudo systemctl list-timers | grep docker-auto-update

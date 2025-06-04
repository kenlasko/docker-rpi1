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

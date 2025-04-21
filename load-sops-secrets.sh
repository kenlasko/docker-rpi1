#!/bin/bash
set -e

export SOPS_AGE_KEY_FILE="/home/ken/.config/sops/age/keys.txt"

sudo mkdir -p /run/secrets
sudo rm /run/secrets/*

# Decrypt and write each secret
sops -d /docker/secrets.yaml | yq -r 'to_entries[] | "\(.key)=\(.value)"' | while IFS="=" read -r key value; do
  echo -n "$value" > "/run/secrets/$key"
  chmod 600 "/run/secrets/$key"
done

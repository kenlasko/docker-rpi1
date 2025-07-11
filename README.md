# Introduction
This is the repo for my "main" Raspberry Pi. It hosts several services such as:
- [Omni](https://github.com/kenlasko/omni): manages Talos-based Kubernetes clusters
- [NetbootXYZ](netbootxyz): Simplified PXE boot setup for Omni-managed Talos nodes
- [AdGuard Home](adguard): DNS ad-blocker. This is synced with my [primary Kubernetes-based instance](https://github.com/kenlasko/k8s/tree/main/manifests/apps/adguard)

## Related Repositories
Links to my other repositories mentioned or used in this repo:
- [K8s Bootstrap](https://github.com/kenlasko/k8s-bootstrap): Bootstraps Kubernetes clusters with essential apps using Terraform/OpenTofu
- [K8s Cluster Configuration](https://github.com/kenlasko/k8s): Manages Kubernetes cluster manifests and workloads.
- [NixOS](https://github.com/kenlasko/nixos-wsl): A declarative OS modified to support my Kubernetes cluster
- [Omni](https://github.com/kenlasko/omni): Creates and manages the Kubernetes clusters.

# Prerequisites
- Docker
- SOPS and age (for secrets management)

# Docker Secrets
I want to ensure that all secrets are properly encrypted at rest so that I can store the repo on Github. This is accomplished via a few scripts:
- [load-sops-secrets.sh](load-sops-secrets.sh)
- [setup-sops-secret-builder.sh](setup-sops-secret-builder.sh)

Secrets are encrypted via SOPS/age into [secrets.yaml](secrets.yaml). Some secrets that are stored here include:
* `OMNI_JOIN_TOKEN` - token used for joining new machines to Omni
* `/docker/.env` - environment variables for `docker-compose`
* `/docker/omni/omni.asc` - PGP key for authenticating Omni
* `/docker/netbootxyz/config/menus/local/omni.ipxe` - Custom NetBootXYZ menu for Omni. Contains join token, so must be kept secret

[load-sops-secrets.sh](load-sops-secrets.sh) will parse [secrets.yaml](secrets.yaml) and will create files at the specified location or individual secrets under `/run/secrets`. An example `secrets.yaml` is below:
```yaml
STANDALONE_SECRET: mysecretvalue
/docker/.env: |
  SECRET1: mysecretvalue1
  SECRET2: mysecretvalue2
```
`STANDALONE_SECRET` will be placed in a file at `/run/secrets/STANDALONE_SECRET`
`/docker/.env` will create a secret in a file located at `/docker/.env`

[setup-sops-secret-builder.sh](setup-sops-secret-builder.sh) creates a series of `systemd` services that will watch for changes in `secrets.yaml` and will trigger the [load-sops-secrets.sh](load-sops-secrets.sh)

# Updates
Docker container updates are managed via [Renovate](https://github.com/renovatebot/renovate). When an update is found, Renovate updates the version number in `docker-compose.yml`.  A [Github Self-Hosted Action](https://github.com/kenlasko/docker-rpi1/actions/runners?tab=self-hosted) runs locally in a Docker container to pull the latest repo changes and restart the affected containers.

This was previously done via a custom service called `docker-auto-update` that checked every 5 minutes to see if there were any repo updates. If so, it ran `git pull` and then `docker compose pull` and `docker compose up -d` to update the relevant containers. The service was created via [setup-docker-auto-update.sh](setup-docker-auto-update.sh), which created the services and the [update-docker.sh](update-docker.sh) script. Now that I am leveraging Github, this script is no longer necessary.


# Installing and Configuring SOPS and age
## Installation
```bash
# Install age
sudo apt install age

# Download the SOPS binary
curl -LO https://github.com/getsops/sops/releases/download/v3.10.2/sops-v3.10.2.linux.arm64

# Move the binary in to your PATH
sudo mv sops-v3.10.2.linux.arm64 /usr/local/bin/sops

# Make the binary executable
sudo chmod +x /usr/local/bin/sops

# Install yq (required for load-sops-secrets.sh)
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_arm64 -O /usr/bin/yq &&   sudo chmod +x /usr/bin/yq

# Download the setup-sops-secret-builder.sh and load-sops-secrets.sh scripts
wget https://raw.githubusercontent.com/kenlasko/docker-rpi1/refs/heads/main/setup-sops-secret-builder.sh
wget https://raw.githubusercontent.com/kenlasko/docker-rpi1/refs/heads/main/load-sops-secrets.sh
chmod u+x create-sops-secret-builder.sh load-sops-secrets.sh

```
## Configure SOPS/age
1. Generate age private key
```bash
mkdir -p ~/.config/sops/age
age-keygen -o ~/.config/sops/age/keys.txt  # Generate private key
```
2. Open `.config/sops/age/keys.txt` and copy the public key value. Save `~/.config/sops/age/keys.txt` somewhere secure off the machine and NOT in the Git repo. If you lose this, you will not be able to decrypt files encrypted with SOPS.
```yaml
# created: 2025-03-28T12:57:52Z
# public key: age1jmeardw5auuj5m6yll49cpxtvge8cklltk9tlmy24xdre3wal4dq5vek65    <--- Copy this (but without the `# public key:` part)
AGE-SECRET-KEY-1QCX332PRGV7GA6R8MJZ7CDU7S9Y5G7J0FU8U0L9PL5DUV835R7YQC7DDU5
```
3. Create a file called `/docker/.sops.yaml` using the template below, and paste the public key into it
```yaml
keys:
  - &primary age1jmeardw5auuj5m6yll49cpxtvge8cklltk9tlmy24xdre3wal4dq5vek65
creation_rules:
  - path_regex: secrets.yaml$
    key_groups:
    - age:
      - *primary
```
4. Create a default `secrets.yaml` by running the below command. SOPS will create a default `secrets.yaml` with some sample content. Remove the sample content, add all desired secrets and save. SOPS will encrypt the contents automatically using the `keys.txt` created earlier.
```bash
sops --config .sops.yaml secrets.yaml
```
5. Verify that `secrets.yaml` is encrypted by running the below command:
```bash
cat /docker/secrets.yaml
```
6. Run [create-sops-secret-builder.sh](create-sops-secret-builder.sh) to create the `systemd` services that will watch for changes in [secrets.yaml](secrets.yaml).


# Troubleshooting
## Secrets Not Loading
- Ensure `secrets.yaml` is properly encrypted using SOPS.
- Verify the `systemd` services are running:
  ```bash
  systemctl status sops-secrets.service
  ```

## Docker containers not auto-updating
- Check the status of the auto-update service
```
systemctl status docker-auto-update.service
systemctl status docker-auto-update.timer
```
- Check the logs 
```
journalctl -u docker-auto-update.service -f
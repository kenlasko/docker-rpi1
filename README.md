# Introduction
This is the repo for my "main" Raspberry Pi. It hosts several services such as:
- [Omni](https://github.com/kenlasko/omni): manages Talos-based Kubernetes clusters
- [NetbootXYZ](netbootxyz): Simplified PXE boot setup for Omni-managed Talos nodes
- [AdGuard Home](adguard): DNS ad-blocker. This is synced with my [primary Kubernetes-based instance](https://github.com/kenlasko/k8s/tree/main/manifests/apps/adguard)

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

# References
- [Installing/Configuring SOPS and age](https://github.com/kenlasko/docker-rpi1/blob/main/docs/SOPS-CONFIG.md)
- [Setting up a Github Self-Hosted Runner](https://github.com/kenlasko/docker-rpi1/blob/main/docs/GITHUB-RUNNER.md)

# Related Repositories
Links to my other repositories mentioned or used in this repo:
- [K8s Cluster Configuration](https://github.com/kenlasko/k8s): Manages Kubernetes cluster manifests and workloads.
- [NixOS](https://github.com/kenlasko/nixos-wsl): A declarative OS modified to support my Kubernetes cluster
- [Omni](https://github.com/kenlasko/omni): Creates and manages the Kubernetes clusters.
# Introduction
This is the repo for my "main" Raspberry Pi. It hosts several services such as:
- Omni
- NetbootXYZ
- AdGuard

# Prerequisites
- Docker
- SOPS and age (for secrets management)

# Docker Secrets
I want to ensure that all secrets are properly encrypted at rest so that I can store the repo on Github. This is accomplished via a few scripts:
- [load-sops-secrets.yaml](load-sops-secrets.yaml)
- [create-sops-secret-builder.sh](create-sops-secret-builder.sh)

Secrets are encrypted via SOPS/age into [secrets.yaml](secrets.yaml)

[load-sops-secrets.yaml](load-sops-secrets.yaml) will parse [secrets.yaml](secrets.yaml) and will create files at the specified location or individual secrets under `/run/secrets`. An example `secrets.yaml` is below:
```
STANDALONE_SECRET: mysecretvalue
/docker/.env: |
  SECRET1: mysecretvalue1
  SECRET2: mysecretvalue2
```
`STANDALONE_SECRET` will be placed in a file at `/run/secrets/STANDALONE_SECRET`
`/docker/.env` will create a secret in a file located at `/docker/.env`

[create-sops-secret-builder.sh](create-sops-secret-builder.sh) creates a series of `systemd` services that will watch for changes in `secrets.yaml` and will trigger the [load-sops-secrets.yaml](load-sops-secrets.yaml)

# Installing and Configuring SOPS and age
## Installation
```
# Install age
sudo apt install age

# Download the SOPS binary
curl -LO https://github.com/getsops/sops/releases/download/v3.10.2/sops-v3.10.2.linux.arm64

# Move the binary in to your PATH
sudo mv sops-v3.10.2.linux.arm64 /usr/local/bin/sops

# Make the binary executable
sudo chmod +x /usr/local/bin/sops
```
## Configure SOPS/age
1. Generate age private key
```
mkdir -p ~/.config/sops/age
export NIX_CONFIG="experimental-features = nix-command flakes"
nix shell nixpkgs#age -c age-keygen -o ~/.config/sops/age/keys.txt  # Generate private key
```
2. Open `.config/sops/age/keys.txt` and copy the public key value. Save `~/.config/sops/age/keys.txt` somewhere secure off the machine and NOT in the Git repo. If you lose this, you will not be able to decrypt files encrypted with SOPS.
```
# created: 2025-03-28T12:57:52Z
# public key: age1jmeardw5auuj5m6yll49cpxtvge8cklltk9tlmy24xdre3wal4dq5vek65    <--- Copy this (but without the `# public key:` part)
AGE-SECRET-KEY-1QCX332PRGV7GA6R8MJZ7CDU7S9Y5G7J0FU8U0L9PL5DUV835R7YQC7DDU5
```
3. Create a file called `/docker/.sops.yaml` using the template below, and paste the public key into it
```
keys:
  - &primary age1jmeardw5auuj5m6yll49cpxtvge8cklltk9tlmy24xdre3wal4dq5vek65
creation_rules:
  - path_regex: secrets.yaml$
    key_groups:
    - age:
      - *primary
```
4. Create a default `secrets.yaml` by running the below command. SOPS will create a default `secrets.yaml` with some sample content. Remove the sample content, add all desired secrets and save. SOPS will encrypt the contents automatically using the `keys.txt` created earlier.
```
sops --config .sops.yaml config/secrets.yaml
```
5. Verify that `secrets.yaml` is encrypted by running the below command:
```
cat /docker/secrets.yaml
```
6. Run [create-sops-secret-builder.sh](create-sops-secret-builder.sh) to create the `systemd` services that will watch for changes in [secrets.yaml](secrets.yaml).

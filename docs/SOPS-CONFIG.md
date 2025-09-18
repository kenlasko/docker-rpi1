# Installing and Configuring SOPS and age
SOPS is an industry standard for encrypting sensitive content that can then be safely stored in public Git repositories.

I use SOPS along with some custom scripting to automatically update the Docker `.env` file with updated secrets. These scripts run as services.

## SOPS Installation
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
## Secrets Not Updating
- Ensure `secrets.yaml` is properly encrypted using SOPS.
- Verify the `systemd` services are running:
    ```bash
    systemctl status sops-secrets.service
    ```
- Check the logs 
    ```
    sudo journalctl -ru sops-secrets.service
    ```
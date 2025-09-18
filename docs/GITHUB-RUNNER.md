# Setting up a Github Self-Hosted Runner to keep Docker up-to-date
We can approximate the same sort of Kubernetes GitOps functionality in Docker by making use of self-hosted Github runners. When deployed, any changes to files in the repo will trigger a `git pull` in the target machine, followed by a `docker compose up -d` to load any changes.

## Prerequisites
- Docker must be installed in the /docker folder to work properly

## Steps
1. In the Github repo, navigate to `Settings - Actions - Runners`
2. Click on `New self-hosted runner`
3. Make note of the token
4. On the target node, edit the SOPS secret object and add the token to the `.env` object as `GITHUB_RUNNER_TOKEN`
```
sops --config .sops.yaml secrets.yaml
```
5. Add the Github Runner container to the docker-compose.yml file
```
  github-runner:
    container_name: github-runner
    image: myoung34/github-runner:2.328.0
    environment:
      - REPO_URL=https://github.com/kenlasko/pangolin
      - RUNNER_TOKEN=${GITHUB_RUNNER_TOKEN}
      - CONFIGURED_ACTIONS_RUNNER_FILES_DIR=/runner/data
      - DISABLE_AUTOMATIC_DEREGISTRATION=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /docker:/docker
      - ./config/github-runner/runner/data:/runner/data
    restart: unless-stopped
```
6. Make sure the container starts without error. You may have to regenerate the token if you have issues.
7. Ensure the [deploy.yml](/.github/workflows/deploy.yml) file is in the repo in the `.github/workflows` folder.

If all goes well, updates should trigger the github runner workflow.
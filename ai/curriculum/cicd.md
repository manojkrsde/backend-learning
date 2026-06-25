# CI/CD & Infrastructure as Code — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** automating build → test → deploy.

A subset of the full DevOps role — take only what a backend engineer owns.

## Core — learn deeply

- Pipeline stages: build → test → package → deploy. Fail the build on any failing test.
- GitLab CI (`.gitlab-ci.yml`) — you're on GitLab — or GitHub Actions. Pick one and know it well.
- Run unit + Testcontainers integration tests in CI; build the Docker image; push to a registry (ECR); deploy to ECS.
- Cache dependencies in CI; manage secrets/environments in the pipeline.

## Soon, and important — Infrastructure as Code

- Terraform (or Pulumi): provision RDS, ElastiCache, S3, ECS as CODE, not by clicking the console.
  Now a core backend/devops skill, not optional. Learn it once you're deploying by hand and feeling the pain.

## Awareness only

- GitOps (ArgoCD/FluxCD), advanced deploys (blue-green, canary), artifact managers (Nexus/Artifactory).
- Working-level Kubernetes: understand pods/deployments/services and how to deploy to a cluster;
  don't learn to OPERATE one — that's a different job.

## Skip

- Ansible/Chef/Puppet, service mesh (Istio/Linkerd) — platform-team territory.

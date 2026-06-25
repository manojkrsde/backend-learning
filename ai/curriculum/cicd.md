# CI/CD & Infrastructure as Code — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** automating build → test → deploy.

**Why this matters:** CI/CD is how your Java service goes from a green test run to running in AWS without a human clicking anything. It's a subset of the full DevOps role — take only what a backend engineer owns. Move fast on the pipeline shape (you've written `.yml` pipelines before); spend the depth on the Java-specific build/cache steps and the AWS push-and-deploy hops.

## Depth tiers

### Core — learn deeply
- The pipeline shape: **build → test → package → push → deploy**, and **fail the build on any failing test** (never deploy on red).
- Run **unit + Testcontainers integration tests** in CI — needs a Docker daemon available to the runner; this is the step most CI tutorials get wrong.
- **Package** the app as a Docker image (layered JAR, slim base image like a JRE/`eclipse-temurin` or `jib`), then **push to ECR** and **deploy to ECS**.
- **Dependency caching** (the `~/.m2` or Gradle cache) keyed on the lockfile — the difference between a 2-minute and a 12-minute build.
- **Secrets & environments**: inject from a secret store (GitHub Actions secrets, AWS Secrets Manager), never echo them; gate prod behind an environment with required approval.

### Working knowledge
- A second runner flavor: you may be on GitHub Actions in one repo and a `.gitlab-ci.yml` in another — the concepts port directly; only the YAML keywords differ.
- **Kubernetes at deploy-from-the-outside level**: read a Deployment/Service manifest and ship to a cluster. Understand pods/deployments/services — don't learn to *operate* a cluster.
- Build provenance / reproducibility: pinned base images, pinned action versions, deterministic dependency resolution.

### Soon, and important — Infrastructure as Code
- **Terraform** (or Pulumi): provision RDS, ElastiCache, S3, ECS as CODE, not by clicking the console. Now a core backend/devops skill, not optional.
- Deliberately **deferred until you've deployed by hand and felt the pain** — clicking the AWS console teaches you what the IaC is actually declaring. Pull it in after the manual deploy hurts, not before.

### Awareness only
- GitOps (ArgoCD/FluxCD), advanced deploys (blue-green, canary), artifact managers (Nexus/Artifactory).

### Skip — and why
- Ansible/Chef/Puppet, service mesh (Istio/Linkerd) — platform-team territory, not what a backend engineer owns.

## Node → Java delta

The pipeline *shape* is identical to what you ran for a Node service — these are the steps that change.

- **The build artifact is a JVM image, not `node_modules` + source.** You compile to a JAR, then bake it into a Docker image; there's no shipping raw source. Layer the image so dependencies cache separately from your code.
- **The dependency cache is `~/.m2`/Gradle, not `~/.npm`.** Same idea, different path and key — cache on the lockfile (`pom.xml` / `gradle.lockfile`), not on a timestamp.
- **Integration tests need a real Docker daemon in CI.** Testcontainers spins up Postgres/Redis containers during the test phase — the runner must expose Docker (docker-in-docker or a mounted socket). This has no Node equivalent if your Node tests hit in-memory fakes.
- **Cold start matters less, image size still matters.** A fat JVM image is slow to pull on every ECS task; trim the base image and use a layered/`jib` build.

## Learning objectives

After this you can:
- Write a pipeline that builds, runs unit + Testcontainers integration tests, and **stops cold on a test failure**.
- Build a layered Docker image of a Spring Boot app, push it to ECR, and roll it out to ECS.
- Configure dependency caching keyed on the lockfile and measure the build-time win.
- Inject secrets from a store and prove they never appear in build logs.
- Explain why Terraform comes *after* the first manual deploy, and what it would declare.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Stand up a pipeline: build → unit test → fail on red. Confirm a broken test blocks the merge.
- Add a Testcontainers integration stage; make the runner provide a Docker daemon.
- Build a layered Docker image, push it to ECR, deploy the new tag to an ECS service.
- Add dependency caching keyed on the lockfile; compare cold vs warm build times.
- Move one secret out of the YAML into a secret store and verify it's absent from logs.

## Common pitfalls

- **Secrets leaking into build logs** — an `env` dump or a verbose command prints the token; mask and inject, never echo.
- **No dependency caching** — every build re-downloads the world; builds crawl and runners cost more.
- **Non-reproducible builds** — floating base-image tags (`:latest`) or unpinned action versions mean "works today, breaks Tuesday".
- **Deploying on red** — a misconfigured pipeline that ships even when tests fail; the fail-fast gate is the whole point.
- **Reaching for Terraform first** — automating infra you don't yet understand; deploy by hand once, then codify.

## Canonical resource

- GitHub Actions documentation: https://docs.github.com/en/actions

## Modern (2026)

- Prefer **OpenTelemetry instrumentation over vendor build-agents** in the pipeline (cross-ref `observability.md`).
- Use **Testcontainers, not H2**, for the integration stage — test against the real Postgres you deploy on (cross-ref `sql-postgres.md`).
- Keep **Kubernetes at working-awareness**: deploy to a cluster, don't operate one. For most single-service backends, **ECS is the simpler target** than a self-run cluster.

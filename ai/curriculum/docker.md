# Docker — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** running the app + its dependencies consistently.

**Why this matters:** Docker is how you run the JVM app and its backing services the same way on your laptop and in CI/prod. You already containerize Node apps — the delta is almost entirely JVM-specific: a multi-stage build to ship a JRE not a JDK, layer ordering that doesn't bust the cache on every code change, and making the JVM respect container memory limits instead of sizing the heap off the host.

Move fast on images/containers/layers (you know these). Spend the depth on the multi-stage JVM build and JVM-in-container tuning.

## Depth tiers

### Core — learn deeply
- Multi-stage build for a Spring Boot app — build on a JDK, run on a small JRE (or distroless/jlink runtime). Never ship the build toolchain.
- Layer and cache ordering — copy dependency manifests and resolve dependencies in their own layer, *then* copy source. Code changes shouldn't re-download the dependency graph.
- `.dockerignore` — keep `target/`, `.git`, local config, and secrets out of the build context.
- JVM-in-container tuning — modern JVMs are container-aware and read cgroup limits, but you must set the container memory limit and a sane heap (`-XX:MaxRAMPercentage`), not a fixed host-sized `-Xmx`.
- Run as a non-root user; add a `HEALTHCHECK` (or wire the orchestrator to the Actuator health endpoint — see `spring-boot.md`).
- Compose for the local stack — app + Postgres + Redis (Valkey) in one `up`. Use this from early on.

### Working knowledge
- Image-size optimization — distroless or a `jlink` custom runtime; layered/exploded JARs so app code is its own cache layer.
- Tagging and pushing to a registry (ECR — see `aws.md`); env vars for config, named volumes for data, the default bridge network.

### Awareness only
- BuildKit cache mounts and multi-arch builds; container networking beyond the Compose default.

### Skip — and why
- Docker Swarm and LXC — Kubernetes won for orchestration (see `cicd.md` / `aws.md`). Hand-rolling a JRE you can `jlink` instead. Building images with a JDK base at runtime — that's the mistake the multi-stage build exists to prevent.

## Node → Java delta

The container concepts (images, layers, Compose, volumes, networks) are identical to Node — skip them. These are the JVM-specific traps.

- **The artifact is a fat JAR, not a `node_modules` tree.** A Spring Boot JAR bundles every dependency, so the build-vs-run split matters: build with the full JDK + Maven/Gradle, then copy only the JAR onto a JRE.
- **JDK vs JRE is a real size/attack-surface decision.** Node ships one runtime; here the build image (full JDK + toolchain) is large and the runtime image (JRE or distroless) is small. Multi-stage keeps the toolchain out of production.
- **The JVM sizes its heap off available memory.** Without a container memory limit, the JVM sees the *host's* RAM and sets a huge default heap — it then gets OOM-killed by the orchestrator. Set the limit and use percentage-based heap flags.
- **Dependency resolution is the slow layer, not `npm ci`.** Order layers so the dependency download is cached and only re-runs when the build file changes — a single fat layer re-downloads everything on every code edit.
- **Startup is slower and warm-up matters.** JIT means cold starts are real; know that GraalVM native image (see `spring-boot.md`) exists for fast-start/low-memory cases.

## Learning objectives

After this you can:
- Write a multi-stage Dockerfile that builds on a JDK and runs a Spring Boot JAR on a small JRE.
- Order layers so a code-only change rebuilds in seconds without re-resolving dependencies.
- Explain why an un-limited container OOM-kills the JVM, and set a container-aware heap.
- Stand up app + Postgres + Redis with one `docker compose up` and have the app wait for healthy dependencies.
- Justify running as non-root and adding a healthcheck.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Containerize one working vertical slice with a multi-stage Dockerfile; confirm the runtime image has no JDK/Maven in it.
- Add a `.dockerignore` and reorder layers; prove a code-only change skips dependency resolution in the cache.
- Set a container memory limit + `-XX:MaxRAMPercentage`; print `Runtime.maxMemory()` and verify it tracks the limit.
- Write a Compose file for app + Postgres + Redis with healthchecks and `depends_on: condition: service_healthy`.
- Switch the runtime base to distroless (or a `jlink` runtime) and a non-root user; measure the image-size drop.

## Common pitfalls

- Running the container as root — drop to a non-root user; a compromised process shouldn't own the container.
- A single fat layer (`COPY . .` then build) that busts the cache on every source change — split dependency resolution from source copy.
- Ignoring container memory limits — the JVM sizes its heap off the host, then the orchestrator OOM-kills it.
- No `HEALTHCHECK` (or orchestrator probe) — dependents start against a not-yet-ready app and Compose can't gate startup.
- Missing `.dockerignore` — a bloated build context that leaks `target/`, `.git`, and secrets into image layers.

## Canonical resource

- Docker — Dockerfile best practices: https://docs.docker.com/build/building/best-practices/

## Modern (2026)

- Modern JVMs (Java 17+, and certainly your Java 21/25 target) are **container-aware by default** — they read cgroup CPU/memory limits, so you no longer need the old `-XX:+UseContainerSupport` flag. Still set the limit and a percentage-based heap.
- Prefer **distroless or `jlink` custom runtimes** over a full JRE base for production images — smaller and less attack surface.
- Local Redis is the **Valkey** fork now (see `redis.md`); pin it in Compose accordingly.

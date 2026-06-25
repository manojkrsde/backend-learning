# Docker — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** running the app + its dependencies consistently.

## Core — learn deeply

- Images vs containers; how layers and the build cache work; `.dockerignore`.
- Writing a Dockerfile for a Spring Boot app — use a MULTI-STAGE build (build with JDK, run on a small JRE).
- Docker Compose for the local stack: app + Postgres + Redis in one `up`. Use this from early on.
- Config via env vars, volumes for data, basic container networking, healthchecks.

## Working knowledge

- Image-size optimization (distroless / jlink runtime), tagging, pushing to a registry (ECR — see aws.md).

## Awareness only / skip

- Docker Swarm (Kubernetes won — see cicd.md/aws.md for k8s), LXC.

## Sequence

- Containerize once one vertical slice works; run the local stack with Compose before that.

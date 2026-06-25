# AWS — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** deploying to the cloud. **Target:** ECS Fargate behind an ALB.

**Why this matters:** This is where the app actually runs and where money and security incidents are made. You already know cloud concepts — the delta is the AWS specifics and, above all, IAM least-privilege and credential hygiene, which is what gets teams breached and what interviewers probe.

Move fast on the service catalog (you know what a queue/cache/object-store is); spend the depth on IAM, networking boundaries, and how containers get their credentials.

## Depth tiers

### Core — learn deeply
- **IAM**: identities, roles, and policies; least-privilege as the default. Understand the difference between a *principal*, a *role assumed by a service*, and an *attached policy* — this is the single biggest source of both outages and breaches.
- **Credential management**: never static access keys in env. Locally use a profile / SSO; in CI use OIDC-federated short-lived roles; in containers use an **ECS task role** (and a separate task *execution* role for pulling images / secrets). The app should never see a long-lived key.
- **VPC boundaries**: subnets (public vs private), security groups, NAT vs internet gateway. Security groups are stateful allow-lists — scope them to the source SG, not `0.0.0.0/0`.
- **ECS on Fargate behind an ALB**: task definition, service, target group, health checks. This is your default deploy target — know it deeply.
- **RDS for Postgres**: managed Postgres in a private subnet, encryption at rest on, credentials in Secrets Manager.
- **Secrets Manager**: where DB creds and API keys live; injected into the task, rotated, never committed.

### Working knowledge
- **S3** (object storage), **CloudWatch** (logs/metrics/alarms), **SES** (email).
- **ElastiCache** for the cache layer (cross-ref `redis.md`) — see Modern below on the Valkey fork.
- **ALB** routing/listeners, auto-scaling policies, CloudFront (CDN), Route53 (DNS).
- **SQS / SNS** — managed queues & pub/sub (cross-ref `messaging.md`).

### Awareness only
- EKS (Kubernetes) and Lambda — know when each beats Fargate, but Fargate is the default for a Spring service.
- The long tail of services — don't try to master AWS breadth; learn a service when a feature needs it.

### Skip — and why
- CloudFormation hand-authoring and the AWS Console click-ops as a workflow — prefer infrastructure-as-code, but that's Phase 2. Don't go deep on Elastic Beanstalk (legacy abstraction over what you'll run directly on ECS).

## Node → Java delta

The runtime story is mostly the same; these are the AWS-specific things that bite.

- **Credentials are resolved by a provider chain, not read from `process.env`.** The AWS SDK walks profiles → env → container/instance metadata automatically. Lean on that chain (task roles) instead of plumbing keys yourself — the goal is *zero* static keys anywhere.
- **A container deploy is more than `docker run`.** A Fargate service needs a task definition, an execution role, a target group, security groups, and ALB health checks all aligned — a green build does not mean a green deploy.
- **IAM is deny-by-default and per-action.** Unlike a single app-level role, every AWS call is authorized against a policy. "It works on my laptop" usually means your laptop's role is broader than the task role.
- **The JVM container has a memory footprint to size.** Set Fargate task memory and JVM heap deliberately; an OOM-killed task just disappears and restarts.

## Learning objectives

After this you can:
- Write a least-privilege IAM policy scoped to the exact actions and resources a service needs.
- Explain task role vs task execution role, and how a container gets credentials without static keys.
- Stand up an ECS Fargate service behind an ALB with working health checks.
- Put DB credentials in Secrets Manager and inject them into a task — nothing secret in the image or env file.
- Scope a security group to a source SG and justify why a private subnet has no public ingress.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Deploy the Spring app as an ECS Fargate service behind an ALB; wire the health check to Actuator.
- Provision RDS Postgres in a private subnet with encryption at rest; connect only from the task's security group.
- Move DB creds into Secrets Manager and inject them into the task definition.
- Replace any static access keys with an ECS task role; confirm the SDK resolves credentials from the metadata endpoint.
- Federate CI to AWS with OIDC short-lived roles (after CI is green) instead of stored keys.
- Add an SQS queue or S3 bucket for one feature, with an IAM policy scoped to just that resource.

## Common pitfalls

- **Over-broad IAM** — `*:*` or `Resource: *` "to make it work." Scope to actions and ARNs; broad policies are the breach.
- **Open security groups** — `0.0.0.0/0` on a DB or app port. Reference the source security group instead.
- **Unencrypted RDS** — encryption at rest must be enabled at creation; you can't toggle it on a live instance cheaply.
- **Static access keys in env / committed to the repo** — use roles (task role, OIDC in CI) so there's no long-lived secret to leak.
- **Deploying before CI is green** — sequence matters: a passing pipeline gates the deploy, not the other way around.

## Canonical resource

- Amazon ECS Developer Guide: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html

## Modern (2026)

- **ElastiCache**: prefer the **Valkey** engine — the open-source fork of Redis after the license change; AWS offers it as a cheaper, drop-in cache engine (verify pricing against current docs — knowledge ~early 2026).
- **Observability**: ship traces/metrics via **OpenTelemetry** to CloudWatch / X-Ray rather than installing vendor-specific agents (cross-ref `observability.md`).
- **Credentials**: OIDC federation for CI and IAM Roles Anywhere have made long-lived access keys an anti-pattern — treat any static key as a finding to remove.

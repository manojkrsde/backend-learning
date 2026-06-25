# AWS — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** deploying to the cloud. You're already familiar — deepen the backend slice.

## Core backend slice — learn deeply

- IAM: users, roles, policies, least privilege (the thing that bites everyone).
- VPC basics: subnets, security groups, gateways.
- RDS — managed Postgres (your DB in the cloud).
- ElastiCache — managed Redis.
- S3 — object storage. CloudWatch — logs/metrics/alarms. SES — email (your automation work).
- Compute for containers: ECS/Fargate (good default for a Spring app) or EKS (Kubernetes). Lambda for functions.

## Add (the roadmap under-weights these for backend)

- SQS / SNS — managed queues & pub/sub (messaging.md).
- Secrets Manager — keep secrets out of code (security standard).

## Working knowledge

- ALB (load balancer), auto-scaling, CloudFront (CDN), Route53 (DNS).

## Awareness only

- The long tail of services — don't try to master AWS breadth.

## Sequence

- Deploy after CI is green (cicd.md). Provision RDS / ElastiCache / S3 as features require them.
- Default deploy target for a containerized Spring app: ECS Fargate behind an ALB.

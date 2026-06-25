# API design — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** any HTTP endpoint. Overlaps the backend roadmap — treat as one.

## Core — learn deeply

- REST principles: resource naming (plural nouns, no verbs), correct HTTP methods and status codes.
- DTOs vs entities — never expose entities. Versioning in the path (`/api/v1`).
- Pagination on every list; idempotency for safe retries (PUT, POST + idempotency key).
- One consistent error shape: RFC 7807 (`application/problem+json`).
- OpenAPI/Swagger generated from code (springdoc).
- Auth methods: JWT, OAuth2/OIDC; authorization models RBAC and ABAC.

## Working knowledge

- Rate limiting / throttling, HTTP caching, content negotiation.
- Real-time: WebSockets vs Server-Sent Events (SSE); webhooks vs polling.
- gRPC for internal service-to-service calls (when the project goes multi-service).

## Awareness only

- HATEOAS (almost nobody ships it); SOAP (legacy integration only).
- Compliance alphabet — GDPR, PCI-DSS, HIPAA, PII handling — until a specific domain demands it.

## Skip / situational

- GraphQL — hype has cooled and your stack is REST + gRPC. One sitting on what it is and the
  N+1/dataloader problem, then move on unless a job forces it.

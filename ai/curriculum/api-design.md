# API design — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** any HTTP endpoint. Overlaps the backend roadmap — treat as one.

**Why this matters:** Every endpoint you ship is a contract someone else codes against — the shape, the status codes, and the error body are the API, not the implementation behind them. You already know REST from Node; the win here is doing it *consistently* the way the Java ecosystem expects, and having crisp answers when an interviewer probes idempotency, versioning, or your error model.

Move fast on REST basics and verbs/status codes; spend the depth on the consistent error shape, idempotency, and versioning strategy.

## Depth tiers

### Core — learn deeply

- REST semantics: resource naming (plural nouns, no verbs), correct HTTP methods, and *correct* status codes (201 + `Location`, 204, 409, 422 vs 400).
- DTOs vs entities — never expose entities over the wire (leaks schema, causes serialization loops); cross-ref `standards/persistence.md`.
- One consistent error shape: **RFC 9457 / `application/problem+json`** via Spring `ProblemDetail` (cross-ref `spring-boot.md`).
- Idempotency: which methods are idempotent by definition (GET/PUT/DELETE) and how to make POST safe with an idempotency key.
- Pagination on every list (offset vs keyset/cursor) — never return an unbounded collection.
- API versioning strategy and Spring Boot 4's built-in support (see Modern below).
- OpenAPI generated *from code* (springdoc) — the spec is a build artifact, not a hand-maintained doc.
- Auth on the wire: JWT and OAuth2/OIDC; authorization models RBAC and ABAC (the enforcement lives in `spring-boot.md` security).

### Working knowledge

- Rate limiting / throttling, HTTP caching (`ETag`, `Cache-Control`, conditional requests), content negotiation.
- Real-time: WebSockets vs Server-Sent Events (SSE); webhooks vs polling for outbound events.
- gRPC for internal service-to-service calls — when the project goes multi-service.

### Awareness only

- HATEOAS (almost nobody ships it); SOAP (legacy integration only).
- Compliance alphabet — GDPR, PCI-DSS, HIPAA, PII handling — until a specific domain demands it.

### Skip — and why

- GraphQL — hype has cooled and this stack is REST + gRPC. Spend one sitting on what it is and the N+1/dataloader problem, then move on unless a job forces it.

## Node → Java delta

The HTTP concepts are identical — these are the ecosystem conventions that differ, and where the interview lives.

- **The error shape is standardized, not hand-rolled.** In Node you invent a `{ error: ... }` JSON blob per project. Java centralizes it: throw, and `@ControllerAdvice` + `ProblemDetail` emit one RFC 9457 body for every endpoint. Learn the shape, not a bespoke format.
- **DTO mapping is explicit and typed.** No spreading the entity into the response. You define request/response records and map deliberately — the boundary is enforced by the type system.
- **The spec comes from the code.** springdoc reads your controllers, DTOs, and validation annotations and generates OpenAPI — you don't write YAML by hand the way you might wire up Swagger fixtures in Node.
- **Versioning can be framework-native.** Boot 4 understands API versions as a first-class routing concept (below) instead of you splitting routers by path prefix yourself.
- **Status-code discipline is cultural here.** Returning 422 for validation vs 400 for malformed, 409 for conflicts, 201 + `Location` on create — reviewers and interviewers expect precision, not a blanket 200/500.

## Learning objectives

After this you can:
- Name resources and choose the correct method + status code for create/update/delete/conflict cases.
- Return a consistent RFC 9457 `application/problem+json` body from any thrown exception.
- Explain which HTTP methods are idempotent and make a POST safely retryable with an idempotency key.
- Choose offset vs keyset pagination and justify the tradeoff for a given list endpoint.
- Pick a versioning strategy and wire it through Spring Boot 4's built-in API versioning.
- Generate an OpenAPI spec from code and keep it in sync as a build artifact.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Design a resource (create/read/list/update/delete) with correct status codes and a `Location` header on create.
- Convert ad-hoc error JSON to RFC 9457 `ProblemDetail` with a custom problem type for one domain error.
- Add an idempotency key to a POST so retries don't double-create.
- Add keyset pagination to a list endpoint and compare it to offset on a large table.
- Version an endpoint two ways (path prefix and Boot 4 built-in versioning) and contrast them.
- Generate OpenAPI from the controllers and publish it as a build output.

## Common pitfalls

- One catch-all error format per endpoint instead of a single centralized `ProblemDetail` — inconsistency the clients have to special-case.
- Verbs in URLs (`/getUser`, `/createOrder`) and 200-for-everything — the method and status code carry the semantics.
- Exposing JPA entities directly as the response body — schema leak plus lazy-loading serialization blow-ups.
- Unbounded list endpoints — no pagination until the table is large and the endpoint times out in production.
- Treating POST as idempotent — clients retry on timeouts and you double-create without an idempotency key.
- Hand-maintaining the OpenAPI spec until it silently drifts from the code.

## Canonical resource

- RFC 9110 — HTTP Semantics (methods, status codes, the model everything else builds on): https://www.rfc-editor.org/rfc/rfc9110.html

## Modern (2026)

- **Error shape: RFC 9457 / `application/problem+json`**, which *obsoletes* RFC 7807 (same media type, refined spec). Spring's `ProblemDetail` implements it — cite 9457, not 7807, even though older tutorials say 7807.
- **Spring Boot 4 ships built-in API versioning** — version is a first-class routing dimension (via header, media type, or path) instead of you maintaining parallel routers. Prefer it over hand-rolled path-prefix splitting on Boot 4; path versioning still works and is the most common in the wild (verify exact configuration against current docs — knowledge ~early 2026).
- Keep **GraphQL deprioritized** — REST + gRPC is the stack; learn GraphQL's shape and N+1/dataloader problem for interviews, don't adopt it.

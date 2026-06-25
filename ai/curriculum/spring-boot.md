# Spring Boot — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** the whole app. **Target:** Spring Boot 4.x on Java 17+ (Java 21+ recommended).

**Why this matters:** Spring Boot is the framework you'll live in every day — it owns wiring, the web layer, persistence, and security. The skeleton is small; the depth (and the interview questions) live in JPA, Spring Security, and how the magic actually works.

You know MVC, ORMs, and middleware from Node. Move fast on those; spend depth on Spring's dependency-injection container, the JPA/Hibernate session model, and the security filter chain.

## Depth tiers

### Core — learn deeply
- DI / IoC and the bean lifecycle; constructor injection; configuration & profiles.
- Spring MVC: controllers, request/response, content negotiation, DTO mapping.
- Spring Data JPA + Hibernate: repositories, entities, relationships, the entity/persistence-context lifecycle.
- Spring Security: authentication, authorization, the filter chain, OAuth2/OIDC, JWT, method/resource-level checks.
- Bean Validation on request DTOs; centralized error handling with `@ControllerAdvice` (RFC 9457 `ProblemDetail`).
- Actuator (health, metrics) and starters / autoconfiguration — know what magic is happening and how to inspect it.

### Working knowledge (cross-linked to their own files)
- Spring Data Redis (`redis.md`); Spring AMQP / Spring Kafka (`messaging.md`);
  Micrometer + OpenTelemetry (`observability.md`); springdoc for OpenAPI (`api-design.md`); Spring AI (`ai.md`).

### Later — when the project goes multi-service
- Spring Cloud: Gateway, Config, OpenFeign, and circuit breaking via Resilience4j.
  Service discovery: Eureka works, but Kubernetes-native or Consul is common now.

### Awareness only
- WebFlux / reactive — understand it and the tradeoff vs virtual threads; don't default to it. On Boot 4 you can run MVC on virtual threads and keep blocking code.
- GraalVM native image — faster startup / lower memory for serverless; know it exists.

## Node → Java delta

- **The container wires your app, not `import`.** You declare beans; Spring injects them. Favor constructor injection so dependencies are explicit and testable — field injection hides them.
- **Hibernate has a persistence context (the "session").** Entities are *managed* and changes flush automatically — there's no explicit `save` for an already-loaded entity. This is the source of lazy-loading errors and the N+1 problem (see `sql-postgres.md` / `standards/persistence.md`).
- **Security is a filter chain, not one middleware function.** Requests pass through ordered filters; you configure the chain declaratively.
- **Errors map to HTTP centrally.** `@ControllerAdvice` + `ProblemDetail` replaces per-route try/catch and gives every endpoint one consistent error shape.
- **Config is layered + typed.** `application.yml` + profiles + `@ConfigurationProperties` beans, not a hand-rolled `process.env` reader.

## Learning objectives

After this you can:
- Explain how the IoC container resolves and injects a bean, and why constructor injection is preferred.
- Trace a request through controller → service (`@Transactional`) → repository and back.
- Configure a Spring Security filter chain for JWT auth with method-level checks.
- Produce a consistent RFC 9457 error response from a thrown exception via `@ControllerAdvice`.
- Read an Actuator endpoint to inspect health, beans, and autoconfiguration decisions.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Stand up one controller + service + JPA repository and a `@DataJpaTest` against real Postgres (Testcontainers).
- Add Bean Validation to a request DTO and a `@ControllerAdvice` that returns `ProblemDetail`.
- Make the service method `@Transactional`; demonstrate rollback on a runtime exception.
- Add JWT authentication and a method-level `@PreAuthorize` check.
- Expose and read Actuator health/metrics; turn on SQL logging and kill an N+1.

## Common pitfalls

- Field/`@Autowired` injection instead of constructor injection — hides dependencies and breaks testability.
- `LazyInitializationException` from touching a lazy association after the transaction closes.
- Exposing JPA entities directly from controllers instead of mapping to DTOs (leaks schema, causes serialization loops).
- Copying pre-2023 tutorials that use `javax.*` — Boot 3+ is `jakarta.*` (see Modern below).
- Putting `@Transactional` on a controller, or self-invoking it within the same bean (the proxy is bypassed).

## Canonical resource

- Spring Boot reference documentation: https://docs.spring.io/spring-boot/index.html

## Modern (2026) — read before any tutorial

- **Target Spring Boot 4.x** (4.0 GA Nov 2025; 4.1 current). It keeps the **Java 17+ baseline** (Java 21+ recommended) and the **`jakarta.*`** namespace — using `javax.*` is the single most common breakage when copying pre-2023 tutorials.
- **3.x → 4.x delta** (most existing tutorials/jobs are still on 3.x, so know both): Jakarta EE 11 baseline, **Jackson 3**, **JSpecify** null-safety annotations, **built-in API versioning** (see `api-design.md`), auto-configuration split into smaller modules, and a **Gradle 9** baseline. The fundamentals above are unchanged between 3.x and 4.x.
- Use **Resilience4j** for circuit breaking — Hystrix is dead.

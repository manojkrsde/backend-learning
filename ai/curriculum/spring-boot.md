# Spring Boot — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** the whole app. **Target:** Spring Boot 3.x on Java 17+.

Your framework — deepest time alongside Java. The skeleton is small; the depth is in JPA, security, and the web layer.

## Core — learn deeply

- DI / IoC and bean lifecycle; constructor injection; configuration & profiles.
- Spring MVC: controllers, request/response, content negotiation, DTO mapping.
- Spring Data JPA + Hibernate: repositories, entities, relationships, the entity lifecycle.
- Spring Security: authentication, authorization, OAuth2/OIDC, JWT, method/resource-level checks.
- Bean Validation on request DTOs; centralized error handling with `@ControllerAdvice` (RFC 7807).
- Actuator (health, metrics) and starters / autoconfiguration — know what magic is happening.

## Working knowledge (cross-linked to their own files)

- Spring Data Redis (redis.md); Spring AMQP / Spring Kafka (messaging.md);
  Micrometer + OpenTelemetry (observability.md); springdoc for OpenAPI (api-design.md).

## Later — when the project goes multi-service

- Spring Cloud: Gateway, Config, OpenFeign, and circuit breaking via Resilience4j.
  Service discovery: Eureka works, but Kubernetes-native or Consul is common now.

## Awareness only

- WebFlux / reactive — understand it and the tradeoff vs virtual threads; don't default to it.
- Spring AI for the AI feature (ai.md) — first-party, but moving fast; verify maturity.

## Modern (2026) — read before any tutorial

- Spring Boot 3.x requires Java 17+ and uses the `jakarta.*` namespace, NOT `javax.*`. This is the
  single most common breakage when copying pre-2023 tutorials.
- Use Resilience4j for circuit breaking — Hystrix is dead.

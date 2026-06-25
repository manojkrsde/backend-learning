# Testing — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** EVERY task — tests are part of the definition of done.

The area that was almost missed. Detailed rules live in `ai/standards/testing.md`; this is the learning path.

## Core — learn deeply

- The test pyramid: many unit, fewer integration, very few end-to-end. Don't invert it.
- JUnit 5 + Mockito: Arrange–Act–Assert, behavior-named tests, mock only collaborators you own.
- Integration tests with Testcontainers — a REAL Postgres in Docker, not H2 (H2 hides Postgres bugs).
- Spring test slices: `@DataJpaTest`, `@WebMvcTest`; use the full `@SpringBootTest` sparingly (slow).
- What to test: business logic, edge cases, error paths. Every bug fix gets a regression test.

## Working knowledge

- API testing: MockMvc or REST Assured. Mocking external HTTP with WireMock.
- Contract testing (awareness) for service boundaries; load testing (JMeter/Gatling) awareness.

## Quality bar

- Deterministic tests only — no time/order/sleep/network dependence. Fix flaky tests immediately.
- Coverage is a signal, not a target. Cover critical paths meaningfully.

## Modern (2026)

- Testcontainers is the standard for integration tests and a strong quality signal in interviews.

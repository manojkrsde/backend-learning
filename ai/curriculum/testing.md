# Testing — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** EVERY task — tests are part of the definition of done.

**Why this matters:** Tests are the definition of done here, and "how do you test this?" is one of the most reliable interview signals. You already know the discipline from Jest — the win isn't *why* you test, it's the JUnit 5 + Mockito idioms, Spring's test slices, and spinning up a real Postgres instead of an in-memory fake.

Move fast on the AAA structure and assertions you already know; spend the depth on Spring's slice annotations and on Testcontainers. Detailed rules live in `ai/standards/testing.md` — cross-reference it, don't re-derive it here.

## Depth tiers

### Core — learn deeply
- The test pyramid: many unit, fewer integration, very few end-to-end. Don't invert it.
- JUnit 5 + Mockito: Arrange–Act–Assert, behavior-named tests, mock only collaborators you own. Use `@Mock`/`@InjectMocks`, `when(...).thenReturn(...)`, and `verify(...)` — but prefer asserting on outcomes over verifying interactions.
- Integration tests with Testcontainers — a REAL Postgres in Docker, not H2 (H2 hides Postgres bugs).
- Spring test slices: `@DataJpaTest` (repository + real DB), `@WebMvcTest` (controller + MockMvc, no DB). Use the full `@SpringBootTest` sparingly — it boots the whole context and is slow.
- What to test: business logic, edge cases, error paths. Every bug fix gets a regression test first (red), then the fix (green).

### Working knowledge
- AssertJ for fluent assertions (`assertThat(x).isEqualTo(...)`) — far more readable than raw JUnit asserts.
- API testing: MockMvc (slice) or REST Assured (full server). Mocking external HTTP with WireMock.
- `@ParameterizedTest` for table-driven cases; `@Testcontainers` lifecycle and reusing a container across a class.

### Awareness only
- Contract testing (Spring Cloud Contract / Pact) for service boundaries — matters once you go multi-service.
- Load testing (Gatling/JMeter) and mutation testing (PIT) — know they exist; pull them when a project demands it.

### Skip — and why
- H2 / in-memory DBs for persistence tests — Testcontainers gives you the real engine; H2 silently passes code that breaks on Postgres.
- TestNG — JUnit 5 is the standard. Hamcrest matchers — AssertJ has largely replaced them. Chasing a coverage % as a goal.

## Node → Java delta

The discipline carries over from Jest; these are the things that are genuinely different.

- **JUnit 5 + Mockito instead of Jest.** No bundled runner/assertion/mock library — it's JUnit 5 (engine), Mockito (mocks), and AssertJ (assertions) composed together. Mocking is explicit object wiring, not `jest.mock()` hoisting a module path.
- **Spring test slices have no Jest analogue.** `@WebMvcTest` loads only the web layer; `@DataJpaTest` loads only persistence against a real DB. You boot a *partial* application context tuned to what you're testing — far faster than the whole app.
- **Real Postgres via Testcontainers, not an in-memory stub.** Where a Node test might hit an in-memory store, here you run the actual database in a throwaway Docker container. Same engine, same SQL dialect, same constraint behavior as production.
- **The compiler is your first test layer.** Static types catch in `mvn test`'s compile phase what you'd write runtime type assertions for in TS — so test the behavior, not the shapes.

## Learning objectives

After this you can:
- Write a Mockito-based unit test that mocks a collaborator and asserts on the returned outcome, not just `verify()` calls.
- Choose the right tool for a test: `@WebMvcTest` for a controller, `@DataJpaTest` + Testcontainers for a repository, plain JUnit for pure logic.
- Stand up a Postgres Testcontainer and run a repository test against it.
- Explain why the pyramid is shaped the way it is and spot an inverted one.
- Turn a reported bug into a failing regression test, then make it pass.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Unit-test a service with a mocked repository (Mockito); assert on the result and one error path.
- Write a `@WebMvcTest` for a controller with MockMvc — assert status, body, and a validation failure.
- Write a `@DataJpaTest` against real Postgres via Testcontainers; assert a custom query and a constraint violation.
- Convert a set of edge cases into a single `@ParameterizedTest`.
- Reproduce a bug as a failing test first, then fix it (red → green regression).

## Common pitfalls

- **Over-mocking hides bugs.** Mock only collaborators you own and that cross a boundary; mocking everything tests your mocks, not your code.
- **Inverting the pyramid** — leaning on slow end-to-end tests instead of fast units makes the suite slow and flaky, so it stops getting run.
- **Flaky tests from sleep/time/order dependence.** No `Thread.sleep`, no reliance on wall-clock or test execution order — inject a clock, await conditions explicitly. Fix flakes immediately.
- **Asserting on exact error message strings** — assert on the exception *type* and status code; message text is not a contract and will churn.
- **Reaching for `@SpringBootTest` by default** — it boots the whole context. Use a slice unless you genuinely need the full app.

## Canonical resource

- JUnit 5 User Guide: https://docs.junit.org/current/user-guide/

## Modern (2026)

- **Testcontainers is the standard** for integration tests and a strong quality signal in interviews — name it when asked how you test against a database.
- JUnit 5 (Jupiter) is current; Spring Boot 4.x ships first-class Testcontainers support (`@ServiceConnection` wires the container into your context automatically). Skip H2 for persistence tests.

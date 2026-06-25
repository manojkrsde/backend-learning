# Testing

The review standard for tests. The learning file is `ai/curriculum/testing.md` — cross-reference,
don't duplicate. Baseline: JUnit 5 (Jupiter), Spring Boot 4.x, Java 17+, `jakarta.*` test imports.

## The shape (test pyramid)

Many fast unit tests, fewer integration tests, very few end-to-end. Don't invert it. An inverted
pyramid (everything an `@SpringBootTest`) gives slow, flaky suites that nobody runs locally.

## Unit tests

- JUnit 5 + Mockito. Test one unit; mock its collaborators.
- Only mock what you own — never mock value objects or types you don't control.
- Structure every test Arrange–Act–Assert; one behavior per test.
- Name tests for behavior: `returnsEmptyList_whenNoOrdersExist`. The name says what, not "test1".
- Prefer asserting on outcomes (return value, state) over `verify(...)` on interactions. Over-verifying
  pins the test to the implementation, so a harmless refactor turns the suite red.

Use constructor injection so collaborators are explicit and the unit is testable without Spring.

```java
// bad — field injection: hidden dep, needs reflection (or a running context) to test
@Service class OrderService { @Autowired private OrderRepo repo; }

// good — constructor injection: deps are explicit, new it up in a plain JUnit test
@Service class OrderService {
    private final OrderRepo repo;
    OrderService(OrderRepo repo) { this.repo = repo; }
}
```

Why it costs at scale: field injection lets a class quietly accrete hidden dependencies until the
wiring graph is untestable and every test needs the full Spring context.

Don't mock types you don't own (JPA repos at the boundary, `ObjectMapper`, time, HTTP clients) just
to dodge a real dependency — you end up asserting your *assumptions* about their behavior, not reality.

```java
// bad — mock the repo, then assert the mock returned what you told it to: tests nothing real
when(orderRepo.findByStatus(SHIPPED)).thenReturn(List.of(order));
assertThat(service.shipped()).containsExactly(order); // green even if the query is wrong

// good — exercise the real query against a real Postgres (see Integration tests)
orderRepo.save(shippedOrder); orderRepo.save(pendingOrder);
assertThat(orderRepo.findByStatus(SHIPPED)).containsExactly(shippedOrder);
```

Why it costs at scale: a fully mocked repository layer can't catch a wrong `@Query`, a bad column
mapping, or a lazy-load that explodes — those surface in production instead.

## Integration tests

- Test real wiring (repository + DB, controller + service) with Testcontainers running a REAL
  Postgres — not H2, not mocks. H2 hides Postgres-specific bugs.
- Use `@SpringBootTest` sparingly (slow, boots the whole context); prefer slices like `@DataJpaTest`
  (repository + real DB) and `@WebMvcTest` (controller + MockMvc, no DB).

H2 speaks a different SQL dialect than Postgres — JSONB, arrays, `ON CONFLICT`, partial indexes,
`citext`, and many functions differ or don't exist. A green H2 test is not evidence Postgres works.

```java
// bad — in-memory H2 stands in for prod Postgres: dialect drift hides real failures
@DataJpaTest
@AutoConfigureTestDatabase(replace = ANY) // silently swaps in H2
class OrderRepoTest { /* JSONB column "works" here, fails on Postgres */ }

// good — real Postgres in Docker; what passes here is what prod runs
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = NONE) // keep the container datasource
class OrderRepoTest {
    @Container @ServiceConnection
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
}
```

`@ServiceConnection` (Spring Boot 3.1+) wires the container's JDBC URL/credentials into the context
automatically — no manual `@DynamicPropertySource` (verify against current docs — knowledge ~early 2026).

## What to test

- Cover business logic, edge cases, and error paths — not getters/setters or the framework itself.
- Every bug fix gets a regression test that fails before the fix and passes after (red, then green).
- Assert on error responses too: for HTTP, assert the RFC 9457 `ProblemDetail` shape (`type`, `title`,
  `status`, `detail`) — not just the status code. See `ai/standards/errors-and-logging.md`.

## Quality

- Tests must be deterministic: no reliance on time, ordering, sleeps, or external network. Fix a
  flaky test immediately — a flaky test is worse than no test, because it erodes trust in green.
- Coverage is a signal, not a target. Cover critical paths meaningfully; don't chase a magic number.
- Keep test data builders small and readable.

Never `Thread.sleep` to wait for async work — it's slow when generous and flaky when tight. Poll for
the condition instead.

```java
// bad — guess a duration; passes on your laptop, flakes in CI under load
processor.submit(job);
Thread.sleep(500);
assertThat(repo.findById(job.id())).isPresent();

// good — wait for the actual condition, with a bound (Awaitility)
processor.submit(job);
await().atMost(Duration.ofSeconds(5))
       .untilAsserted(() -> assertThat(repo.findById(job.id())).isPresent());
```

Why it costs at scale: every `sleep` is dead time multiplied across the suite, and the flake it
papers over resurfaces as a 2am CI failure nobody can reproduce.

Don't depend on test or row ordering. JUnit doesn't guarantee method order, and a query without
`ORDER BY` returns rows in whatever order Postgres chooses.

```java
// bad — assumes insertion order survives the round-trip; breaks under a different plan
assertThat(repo.findAll()).extracting(Order::id).containsExactly(1L, 2L, 3L);

// good — assert membership when order is irrelevant, or query with an explicit ORDER BY
assertThat(repo.findAll()).extracting(Order::id).containsExactlyInAnyOrder(1L, 2L, 3L);
```

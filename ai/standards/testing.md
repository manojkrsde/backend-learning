# Testing

## The shape (test pyramid)

Many fast unit tests, fewer integration tests, very few end-to-end. Don't invert it.

## Unit tests

- JUnit 5 + Mockito. Test one unit; mock its collaborators.
- Only mock what you own — never mock value objects or types you don't control.
- Structure every test Arrange–Act–Assert; one behavior per test.
- Name tests for behavior: `returnsEmptyList_whenNoOrdersExist`. The name says what, not "test1".

## Integration tests

- Test real wiring (repository + DB, controller + service) with Testcontainers running a REAL
  Postgres — not H2, not mocks. H2 hides Postgres-specific bugs.
- Use `@SpringBootTest` sparingly (slow); prefer slices like `@DataJpaTest`, `@WebMvcTest`.

## What to test

- Cover business logic, edge cases, and error paths — not getters/setters or the framework itself.
- Every bug fix gets a test that fails before the fix and passes after.

## Quality

- Tests must be deterministic: no reliance on time, ordering, sleeps, or external network. Fix a
  flaky test immediately — a flaky test is worse than no test.
- Coverage is a signal, not a target. Cover critical paths meaningfully, don't chase a magic number.
- Keep test data builders small and readable.

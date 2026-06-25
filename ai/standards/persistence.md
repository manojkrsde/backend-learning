# Persistence — JPA, Hibernate, Postgres

## Mapping

- Keep entities free of business logic and free of API concerns. Convert entity ↔ DTO at the
  service boundary; the web layer never sees an entity.
- Default associations to LAZY; load what you need with a fetch join or `@EntityGraph`.

## The N+1 trap

- Watch for N+1 queries (one query per row in a loop). Fix with a join fetch, `@EntityGraph`,
  or batch size. Turn on SQL logging in development and read the SQL Hibernate actually generates.

## Transactions

- Put `@Transactional` on SERVICE methods, not controllers or repositories.
- Mark read paths `@Transactional(readOnly = true)`.
- Keep transactions short. Never make an HTTP/network call inside an open transaction.

## Queries

- Never build SQL/JPQL by concatenating user input — use bind parameters (also a security rule).
- Derived queries for simple cases, `@Query` for complex ones, native SQL when you need Postgres features.

## Schema & migrations

- All schema changes go through versioned migrations (Flyway). Set `ddl-auto` to `validate` or
  `none` — NEVER `update` — so Hibernate never silently changes the schema.
- Index foreign keys and columns you filter/sort on. Don't index everything.
- Use Postgres strengths first: JSONB for semi-structured data, real constraints, UPSERT
  (`ON CONFLICT`). Reach for these before adding another datastore.

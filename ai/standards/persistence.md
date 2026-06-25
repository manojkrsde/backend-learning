# Persistence — JPA, Hibernate, Postgres

> Targets Spring Boot 4.x / Spring Data JPA on Java 17+. Imports are `jakarta.persistence.*`
> (never `javax.*`). The Node/TS delta: there is no per-call query you can read inline — an
> ORM session sits between you and SQL, so the cost of a line of code is invisible until you
> read the generated SQL. Assume nothing; turn on SQL logging and look.

## Mapping

- Keep entities free of business logic and free of API concerns. Convert entity ↔ DTO at the
  service boundary; the web layer never sees an entity.
- Default associations to LAZY; load what you need with a fetch join or `@EntityGraph`.

Serializing an entity straight out of a controller is the most common way to ship an
accidental N+1 *and* leak your schema. Jackson walks every getter, and each lazy association
it touches fires another query — outside any transaction, so it usually throws
`LazyInitializationException` instead.

```java
// bad: entity escapes to the web layer; Jackson triggers lazy loads / leaks columns
@GetMapping("/{id}") Order get(@PathVariable Long id){ return repo.findById(id).orElseThrow(); }

// good: map to a DTO inside the service, return only what the API promises
@GetMapping("/{id}") OrderDto get(@PathVariable Long id){ return service.getOrder(id); }
```

Why it costs at scale: an entity on the wire couples your JSON contract to your table layout —
a column rename becomes a breaking API change, and lazy fields turn read endpoints into query storms.

- Use a surrogate key (`@Id @GeneratedValue`). With Postgres prefer `IDENTITY` (DB sequence) over
  the legacy `AUTO`/table generator. Override `equals`/`hashCode` on a stable business key or not
  at all — never on a DB-generated id that is null before persist.
- Map money as `BigDecimal` with explicit precision/scale, never `double`. Timestamps as
  `Instant`/`OffsetDateTime`, never the legacy `java.util.Date`.

## The N+1 trap

- Watch for N+1 queries (one query per row in a loop). Fix with a join fetch, `@EntityGraph`,
  or batch size. Turn on SQL logging in development and read the SQL Hibernate actually generates.

This is the single biggest persistence footgun in Spring. A list endpoint that touches a lazy
association per element issues 1 query for the list plus N for the children. It passes every
test on 3 rows and melts the database at 10,000.

```java
// bad: 1 query for orders + 1 per order for items  ->  N+1
for (Order o : orderRepo.findAll())
    total += o.getItems().size();           // each .getItems() hits the DB

// good: one query, items fetched alongside
@EntityGraph(attributePaths = "items")
List<Order> findAll();                       // or: @Query("select o from Order o join fetch o.items")
```

Why it costs at scale: N+1 is invisible in unit tests and in a near-empty dev DB; it surfaces
as a production latency cliff that scales linearly with row count.

- For a collection you genuinely need on many rows, set `@BatchSize` (or
  `spring.jpa.properties.hibernate.default_batch_fetch_size`) so Hibernate loads children with one
  `IN (…)` instead of N selects.
- Do not `join fetch` two collections at once — that's a cartesian product. Fetch one collection,
  batch the rest. Never paginate (`LIMIT`) a query that join-fetches a collection: Hibernate
  paginates *in memory* and warns (`HHH000104`).

## Transactions

- Put `@Transactional` on SERVICE methods, not controllers or repositories.
- Mark read paths `@Transactional(readOnly = true)`.
- Keep transactions short. Never make an HTTP/network call inside an open transaction.

`@Transactional` on a controller stretches the transaction (and the DB connection it pins) across
view rendering and serialization; it also hides where the business unit-of-work actually begins.
The boundary belongs at the service, which is the unit of work.

```java
// bad: transaction on the controller, spanning serialization and any slow I/O
@Transactional @PostMapping void place(@RequestBody OrderReq r){ service.place(r); }

// good: thin controller, transaction owns exactly the business operation
@PostMapping void place(@RequestBody OrderReq r){ service.place(r); }
class OrderService { @Transactional void place(OrderReq r){ /* ... */ } }
```

Why it costs at scale: a connection held open for the length of an HTTP response exhausts the pool
under load — requests queue, time out, and the app falls over well before the DB is the bottleneck.

Spring's `@Transactional` is a proxy. A self-invocation (calling another `@Transactional` method
via `this`) bypasses the proxy, so the annotation is silently ignored — no new transaction, no
`readOnly`, no rollback rules.

```java
// bad: this.save(...) skips the proxy -> @Transactional on save() does nothing
void importAll(List<Row> rows){ for (Row r : rows) this.save(r); }
@Transactional void save(Row r){ /* ... */ }

// good: cross the proxy via the injected bean (or split into another service)
void importAll(List<Row> rows){ for (Row r : rows) self.save(r); }   // self = injected OrderService
```

Why it costs at scale: a self-invoked transactional method looks correct in code review and runs
without error — until a mid-batch failure leaves half-written rows because nothing ever rolled back.

- Also note: by default Spring rolls back only on unchecked (`RuntimeException`) exceptions. A
  checked exception commits unless you set `rollbackFor`.

## Queries

- Never build SQL/JPQL by concatenating user input — use bind parameters (also a security rule).
- Derived queries for simple cases, `@Query` for complex ones, native SQL when you need Postgres features.

Prefer a DTO projection over fetching whole entities for read-only lists — it selects only the
columns you map and skips the persistence-context/dirty-checking overhead entirely.

```java
// bad: loads full managed entities just to read two fields
List<Order> findByStatus(Status s);          // hydrates every column + tracks each for dirty check

// good: constructor/interface projection selects only what you need
@Query("select new com.app.OrderSummary(o.id, o.total) from Order o where o.status = :s")
List<OrderSummary> summaries(@Param("s") Status s);
```

Why it costs at scale: hydrating and tracking thousands of entities you only read wastes heap and
CPU on dirty-checking that never produces an UPDATE.

## Schema & migrations

- All schema changes go through versioned migrations (Flyway). Set `ddl-auto` to `validate` or
  `none` — NEVER `update` — so Hibernate never silently changes the schema.

`ddl-auto: update` is the classic "works on my machine" trap: Hibernate reconciles the schema to
your entities at boot. It only ever adds; it never drops or alters, drift accumulates silently, and
two instances racing to alter the same table can deadlock on startup.

```yaml
# bad: Hibernate mutates prod schema at startup, unversioned and unreviewed
spring.jpa.hibernate.ddl-auto: update

# good: schema is owned by versioned migrations; Hibernate only checks it matches
spring.jpa.hibernate.ddl-auto: validate   # Flyway runs V1__*.sql, V2__*.sql ... on startup
```

Why it costs at scale: an auto-mutated schema has no history, no review, and no rollback — you
cannot reason about what production's tables actually look like, and a bad inference is unrecoverable.

- Index foreign keys and columns you filter/sort on. Don't index everything. Postgres does **not**
  auto-index foreign keys (only the referenced side, via the unique/PK constraint) — an unindexed FK
  makes the child side of every join and every parent delete a sequential scan.
- Use Postgres strengths first: JSONB for semi-structured data, real constraints, UPSERT
  (`ON CONFLICT`). Reach for these before adding another datastore.
- Migrations are forward-only and immutable once merged: never edit an applied `V#__*.sql`
  (Flyway's checksum will fail validation) — write a new versioned migration instead.

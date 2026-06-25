# SQL & PostgreSQL — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** any feature that stores data. **Target:** PostgreSQL 18 + Spring Data JPA / Hibernate on Java 21+.

**Why this matters:** This is daily work, and it's where most production performance fires start. You know relational concepts cold from Node — the genuinely new part isn't SQL, it's the ORM impedance mismatch sitting between you and the database: managed entities, lazy loading, the N+1 trap, and automatic flush/dirty-checking.

Move fast on SQL itself; spend the depth on the JPA/Hibernate delta below and on reading query plans, because that's what the ORM hides from you and what interviewers probe.

## Depth tiers

### Core — learn deeply
- Joins (all kinds), aggregation + GROUP BY/HAVING, subqueries (incl. correlated).
- Constraints: PK/FK, unique, check, not-null — enforce integrity in the DB, not just the app.
- Transactions and isolation levels (read committed → serializable); what anomalies each prevents.
- Indexes: B-tree, composite, partial; what to index and what NOT to; reading a query plan.
- Window functions, CTEs, recursive queries — the skills that separate a mid from a junior.
- EXPLAIN / ANALYZE: read it, find the slow node, fix it.
- The JPA/Hibernate persistence context: managed entities, dirty-checking, flush timing, lazy vs eager fetch, and killing N+1 — the real Node→Java delta (cross-ref `spring-boot.md` / `standards/persistence.md`).

### Working knowledge
- Postgres-specific wins the generic roadmap misses: JSONB (query + GIN-index semi-structured data — this is WHY Postgres-first beats reaching for Mongo), UPSERT (`INSERT ... ON CONFLICT`), partitioning, LISTEN/NOTIFY.
- HikariCP connection-pool tuning — pool size, timeouts, leak detection; the pool is the throughput ceiling.
- Views, stored procedures/functions; GRANT/REVOKE and least-privilege DB users.
- Schema migrations as versioned, checked-in files (Flyway or Liquibase) — never `ddl-auto: update` in prod.

### Awareness only
- pgvector — vector similarity search, for the AI feature (cross-ref `ai.md`); pull it only when that feature lands.
- Logical replication, MVCC internals, VACUUM tuning — know the words; reach for them when a real problem points there.

### Skip — and why
- NoSQL / Mongo modeling — Phase 2; Postgres + JSONB covers semi-structured data for now.
- H2 / in-memory DBs for tests — they lie about Postgres behavior; use Testcontainers against real Postgres (cross-ref `testing.md`).
- Native SQL for everything — JPQL / derived queries cover most cases; drop to native SQL deliberately, not by default.

## Node → Java delta

You know SQL, transactions, and indexes — those transfer unchanged. The new part is the ORM layer between you and the database.

- **Entities are *managed*, not plain objects.** Once loaded inside a transaction, an entity is tracked by the persistence context; mutating a field auto-flushes a `UPDATE` on commit. There's no explicit `save` for an already-loaded row — this surprises everyone coming from query-builder land.
- **Lazy loading is a landmine, not a feature.** Associations default to lazy proxies; touch one after the transaction closes and you get `LazyInitializationException`. Decide fetch strategy per query (fetch join / entity graph), not by flipping everything to EAGER.
- **The N+1 problem is invisible until you turn on SQL logging.** Iterating a collection of entities silently fires one query per row. Hibernate won't warn you — your logs and the query plan will.
- **`@Transactional` defines the persistence-context boundary.** It's not just rollback control; it's the window in which entities are managed and lazy loads work. Self-invocation bypasses the proxy and the boundary (cross-ref `spring-boot.md`).
- **Connection pooling is explicit and tunable.** No event-loop magic — HikariCP hands out a fixed set of connections, and an exhausted pool blocks threads. Size it against DB `max_connections`, not optimistically.

## Learning objectives

After this you can:
- Read an EXPLAIN ANALYZE plan, find the slow node (seq scan, nested loop), and add the index that fixes it.
- Spot an N+1 in SQL logs and fix it with a fetch join or entity graph — and explain why it happened.
- Choose an isolation level for a given anomaly and justify it.
- Decide lazy vs eager per use case and explain the persistence-context lifecycle that makes lazy fail.
- Add a FK with its supporting index, and explain why the index isn't automatic in Postgres.
- Tune a HikariCP pool against Postgres `max_connections` and detect a leak.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Add an entity with a `@OneToMany`; reproduce an N+1 in the logs, then kill it with a fetch join.
- Write a report query with a window function + CTE; back it with a covering composite index and verify via EXPLAIN.
- Store a flexible attributes blob as JSONB, query it, and add a GIN index.
- Implement an idempotent upsert with `INSERT ... ON CONFLICT` behind a repository method.
- Add a Flyway migration that creates a FK *and* its index; demonstrate the slow query without the index.
- Tune HikariCP, then run a load test that exhausts the pool and read the timeout behavior.

## Common pitfalls

- **N+1 from Hibernate** — the default lazy iteration that fires a query per row; invisible until SQL logging is on.
- **Missing FK indexes** — Postgres indexes the PK automatically but NOT the foreign-key column; joins and cascade deletes go full-scan without it.
- **Accidental cartesian joins** — a forgotten join condition (or fetch-joining two collections) multiplies rows; the row count and EXPLAIN give it away.
- **Leaving fetch type EAGER** — fixes one `LazyInitializationException` and globally over-fetches every query forever; fix the query, not the mapping.
- **No connection-pool tuning** — default/over-sized HikariCP pools either bottleneck or overwhelm Postgres `max_connections`; size deliberately.

## Canonical resource

- PostgreSQL documentation (current): https://www.postgresql.org/docs/current/

## Modern (2026)

- **Postgres 18 is the current major** (mid-2026); stay on a supported major. Postgres-first — it has eaten many NoSQL use cases (JSONB, full-text, pgvector), so reach for another datastore deliberately, not by default.
- Test against **real Postgres via Testcontainers**, never H2 — in-memory DBs disagree with Postgres on types, JSONB, and locking.

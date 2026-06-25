# SQL & PostgreSQL — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** any feature that stores data.

Daily work. You know relational concepts, so go straight to advanced query skills and the
Postgres-specific features the generic roadmap misses.

## Core — learn deeply

- Joins (all kinds), aggregation + GROUP BY/HAVING, subqueries (incl. correlated).
- Constraints: PK/FK, unique, check, not-null — enforce integrity in the DB, not just the app.
- Transactions and isolation levels (read committed → serializable); what anomalies each prevents.
- Indexes: B-tree, composite, partial; what to index and what NOT to; reading a query plan.
- Window functions, CTEs, recursive queries — the skills that separate a mid from a junior.
- EXPLAIN / ANALYZE: read it, find the slow node, fix it.

## Postgres-specific (the generic roadmap misses these)

- JSONB — query and index semi-structured data (this is WHY Postgres-first beats reaching for Mongo).
- UPSERT (`INSERT ... ON CONFLICT`), partitioning, LISTEN/NOTIFY.
- pgvector — vector similarity search, for the AI feature (ai.md).

## Working knowledge

- Views, stored procedures/functions; GRANT/REVOKE and least-privilege DB users.

## Pair with

- JPA/Hibernate (spring-boot.md): turn on SQL logging, read what the ORM generates, kill N+1 at the source.

## Modern (2026)

- Postgres-first: it has eaten many NoSQL use cases. Reach for another datastore deliberately, not by default.

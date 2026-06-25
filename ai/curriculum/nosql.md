# NoSQL — curriculum (Phase 2 deep-dive)

**Phase:** 2 · **Priority:** deep-dive · **Pulls in:** a problem whose access pattern genuinely fits NoSQL.

In Phase 2 you pick ONE NoSQL database to go deep on — chosen by the problem and current popularity,
not defaulted to Mongo. Postgres-first still applies: reach for NoSQL only when its model fits the access pattern.

## Step 1 — pick the family by the problem

- Document (MongoDB) — flexible/nested schemas, content, catalogs. Most popular document DB.
- Key-value (Redis, DynamoDB) — caching, sessions, simple ultra-fast lookups. DynamoDB if AWS-native.
- Wide-column (Cassandra / ScyllaDB) — write-heavy, time-series, massive scale. Model AROUND queries.
- Graph (Neo4j) — relationship-heavy traversals: social graphs, recommendations, fraud.

## Step 2 — decide

- Write down the access patterns FIRST, then choose the family whose strength matches them.

## Step 3 — go deep on the chosen one

- Data modeling for that paradigm (access-pattern-driven design; denormalization where it fits).
- Indexing, the consistency model, partitioning/sharding, and its Spring Data module / driver.
- Build a small focused project that needs exactly that DB's strength (see portfolio-project.md).

## Modern (2026)

- DynamoDB for AWS-native key-value; ScyllaDB as a faster Cassandra-compatible option; MongoDB still
  the default document store. Choose when you start the Phase-2 project, against a real problem.

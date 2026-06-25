# NoSQL — curriculum

**Phase:** 2 · **Priority:** deep-dive · **Pulls in:** a problem whose access pattern genuinely fits NoSQL · **Target:** ONE NoSQL store chosen by the problem, gone deep.

**Why this matters:** You already know what NoSQL *is* from Node — the win here isn't the catalog, it's the discipline of choosing the right family for an access pattern instead of reaching for Mongo by reflex, and modeling for it without dragging your relational habits along. The hard part coming from Postgres/JPA is unlearning the join.

Move fast on the families you'll never use; spend the depth on the SQL→NoSQL modeling delta and on the one store your project actually needs. **Postgres-first still applies** — reach for NoSQL only when its model fits the access pattern, not because it sounds scalable.

## SQL → NoSQL delta

This is where Postgres/JPA muscle memory actively hurts. These are the things that get *harder*, not easier.

- **No joins.** You can't `JOIN` your way out of a bad model. Related data is either embedded in one document or fetched in multiple round-trips your app stitches together. The query planner won't save you.
- **Denormalization is the design, not a smell.** In Postgres you normalize and join on read; here you duplicate data so reads are single-key lookups. You trade write complexity and storage for read speed — on purpose.
- **Access-pattern-first modeling, not entity-first.** With JPA you model entities, then query them however. With NoSQL you write the queries FIRST and design tables/documents to serve exactly those — the schema is a function of the access patterns, and a new query often means a new table or a duplicate copy.
- **Eventual consistency is a real mode, not a bug.** Many of these stores default to "you might read a slightly stale value." You choose consistency per-operation; the strong-by-default ACID guarantees of Postgres are no longer free.
- **No schema enforcement at the DB.** Validation moves into your application (and Bean Validation on DTOs), so schema drift across documents is your problem to police.

## Learning objectives

After this you can:
- Write down a feature's access patterns first and pick the NoSQL family whose strength matches them — or correctly conclude Postgres is still the right call.
- Explain the trade-off table below from memory: which family fits which read/write shape, its consistency model, and where its scaling story hurts.
- Model data for the chosen store access-pattern-first, denormalizing deliberately and justifying each duplicated copy.
- Reason about a partition/shard key and predict where a hot key or unbounded partition will bite.
- Wire the chosen store through its Spring Data module or official driver and back the integration test with Testcontainers (not an in-memory fake).

## Step 1 — pick the family by the problem

| Family | Examples | Best-fit access pattern | Consistency model | Where scaling hurts |
|---|---|---|---|---|
| **Document** | MongoDB | Flexible/nested schemas read as a whole — catalogs, content, profiles | Tunable; strong on primary, eventual on secondaries | Cross-document joins (`$lookup`) and unbounded array growth in one doc |
| **Key-value** | Redis/Valkey, DynamoDB | Single-key lookups at scale — cache, sessions, feature flags | Redis: in-memory, async persistence. DynamoDB: eventual default, strong opt-in | Any query that isn't by the key; hot partition keys |
| **Wide-column** | Cassandra, ScyllaDB | Write-heavy, time-series, massive horizontal scale — model AROUND the query | Tunable per-query (quorum); no real transactions | Unbounded partitions; queries the partition key didn't anticipate |
| **Graph** | Neo4j | Relationship-heavy multi-hop traversals — social graphs, recommendations, fraud | Mostly strong (single instance); clustering is the hard part | Supernodes (one node with millions of edges); horizontal scaling |

## Step 2 — decide

- **Write the access patterns down FIRST**, then choose the family whose strength matches them. "We read a user's whole profile by id" → document or key-value. "We traverse who-follows-who 3 hops deep" → graph. "Append-only events queried by time range per device" → wide-column.
- If the patterns are relational with ad-hoc queries, the right answer is often **still Postgres**. Don't pay the NoSQL tax for a workload that joins.

## Step 3 — go deep on the chosen one

- **Data modeling for that paradigm** — access-pattern-driven design, deliberate denormalization, and (for wide-column) building the table per query.
- **Indexing, the consistency model, partitioning/sharding,** and its Spring Data module or official driver.
- **Build a small focused project** that needs exactly that store's strength (see `portfolio-project.md`) and back its integration tests with Testcontainers.

## Common modeling pitfalls

- **Modeling for SQL-style queries** — building normalized "tables" and expecting to join them later. The model has to serve your reads as single lookups.
- **Hot partition keys.** A low-cardinality or time-bucketed key (e.g. `status` or today's date) funnels all traffic to one partition — throttling in DynamoDB, a single hot node in Cassandra.
- **Over-denormalization drift.** Duplicate a value into ten places and one update later they disagree. Track every copy and have a plan to fan out writes.
- **Unbounded growth in one place** — an ever-growing array in a Mongo document or a partition that never stops accepting rows in Cassandra. Both eventually blow size/performance limits.
- **Treating eventual consistency as a bug.** Reading your own just-written value isn't guaranteed by default; design for it or opt into a strong read where it matters.

## Canonical resource

- NoSQL Design for DynamoDB (AWS) — the clearest statement of access-pattern-first modeling: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html

## Modern (2026)

- **DynamoDB** for AWS-native key-value/document at scale; **ScyllaDB** as a faster, drop-in Cassandra-compatible wide-column option; **MongoDB** is still the default document store. Choose when you start the Phase-2 project, against a real problem — not before.

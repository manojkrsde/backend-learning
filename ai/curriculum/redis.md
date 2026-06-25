# Redis — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** a hot read path, sessions, or rate limiting.

**Why this matters:** Redis is the in-memory layer you reach for when Postgres is too slow for a hot path — caching, sessions, rate limiting, leaderboards. You already know what a cache is; the win here is using it *well* (eviction, TTL, atomicity) and explaining the tradeoffs an interviewer probes. Learn it as a caching layer, not as a DBA.

Move fast on the data structures and basic commands; spend depth on eviction policy, the single-threaded execution model, and the cache patterns that fail in production.

## Depth tiers

### Core — learn deeply

- Data structures: strings, hashes, lists, sets, sorted sets — and what each is genuinely good for (a leaderboard is a sorted set, a counter is a string with `INCR`).
- TTL / expiration and the **cache-aside** pattern (the one you'll use most). Sensible, namespaced key naming (`user:42:profile`).
- The **eviction policy** — what happens when `maxmemory` is hit (`allkeys-lru`, `volatile-ttl`, `noeviction`). This is the setting people forget and then page about.
- Atomic ops: `INCR`/`DECR`, `SETNX`, pipelining for batching round-trips.

### Working knowledge

- Cache invalidation strategies and the **stampede** problem (locks, jitter, request coalescing).
- Pub/sub and **Streams** (a lightweight queue) — know the shape; reach for a real broker when you need durability (see `messaging.md`).
- Lua scripting / `MULTI`-`EXEC` for multi-step atomicity, and distributed locking caveats.

### Awareness only

- Persistence (RDB snapshots vs AOF), Sentinel/Cluster, Redis-on-Flash, geo-distribution, modules (RedisJSON/Search), Enterprise.

### Skip — and why

- Running and tuning your own Redis cluster — on AWS you use a managed ElastiCache node; operations is not your job here.

## Node → Java delta

- **The cache is single-threaded — on purpose.** Commands run one at a time on one core, which is *why* `INCR` is atomic with no lock. A single big key (a huge hash or a `KEYS *` scan) blocks every other client. Same engine you used from Node; the discipline is identical, so this is mostly *not* new — the new part is the Spring wiring below.
- **`@Cacheable` does the cache-aside dance for you.** Spring's caching abstraction wraps a method so the lookup/store/TTL is declarative — but it hides *which* serializer and TTL you got. Configure them explicitly or you'll cache Java-serialized blobs no other tool can read.
- **Serialization is a choice you must make.** Lettuce (the default client) hands you bytes; pick JSON (`GenericJackson2JsonRedisSerializer`) over JDK serialization so keys/values are inspectable and portable.
- **Connections are pooled and blocking-friendly.** Lettuce is async-capable but you'll call it with straight-line blocking code on virtual threads — no reactive ceremony required.

## Learning objectives

After this you can:
- Pick the right data structure for a use case and justify it (sorted set for ranking, hash for a struct).
- Implement cache-aside with a sensible TTL and explain how you'd invalidate it.
- State the eviction policy you'd set for a pure cache vs a session store, and why.
- Explain why Redis is atomic without locks, and what a "big key" does to latency.
- Wire Spring Data Redis with an explicit JSON serializer and per-cache TTLs.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Cache a hot read (e.g. a product lookup) with `@Cacheable`, an explicit TTL, and JSON serialization.
- Implement a fixed-window rate limiter with `INCR` + `EXPIRE` and reason about its atomicity.
- Build a leaderboard with a sorted set (`ZADD`/`ZREVRANGE`) and read top-N.
- Add stampede protection to the hot read (a short lock or staggered TTL jitter) and explain the failure it prevents.
- Move HTTP session state into Redis and set an eviction policy appropriate for sessions.

## Common pitfalls

- **Cache stampede** — many requests miss the same expired key at once and all hit the DB. Add a lock, request coalescing, or TTL jitter.
- **No / wrong eviction policy** — leaving `noeviction` on a pure cache means writes start failing at `maxmemory` instead of evicting cold keys.
- **Treating Redis as durable storage** — it's a cache; assume any key can vanish (eviction, restart, failover). The DB is the source of truth.
- **Unbounded key growth** — every key needs a TTL or a bounded size, or memory creeps until eviction (or OOM) bites.
- **A big key blocking the single thread** — one huge value or an `O(n)` command (`KEYS *`, large `ZRANGE`) stalls all clients. Keep values small; use `SCAN`.

## Wire it in

- **Spring Data Redis** (Lettuce client) for `RedisTemplate` and the `@Cacheable`/`@CacheEvict` abstraction. On AWS, use **ElastiCache** (managed Redis/Valkey) — see `aws.md`.

## Canonical resource

- Redis documentation: https://redis.io/docs/latest/

## Modern (2026)

- Redis's license changed in 2024, spawning the **Valkey** fork (now under the Linux Foundation) — same commands and wire protocol, just know the name exists. AWS ElastiCache offers Valkey nodes (cheaper than the Redis-branded ones), and most clients/Spring Data Redis talk to either unchanged.

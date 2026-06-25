# Redis — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** a hot read path, sessions, or rate limiting.

Learn it as a caching layer, not as a DBA. Go just deep enough to use it well and explain the tradeoffs.

## Core — learn deeply

- Data structures: strings, hashes, lists, sets, sorted sets — and what each is good for.
- TTL / expiration and the cache-aside pattern (the one you'll use most). Sensible key naming.
- Atomic ops, INCR/DECR, pipelining for batching.

## Use cases to understand

- Caching, session store, rate limiting, leaderboards (sorted sets), pub/sub, Streams (a lightweight queue).

## Awareness only

- Persistence (RDB vs AOF), Sentinel/Cluster, Redis-on-Flash, geo-distribution, modules (RedisJSON/Search), Enterprise.

## Wire it in

- Spring Data Redis. On AWS, use ElastiCache (managed) — see aws.md.

## Modern (2026)

- Redis's license changed in 2024, spawning the Valkey fork — same commands, just know the name exists.

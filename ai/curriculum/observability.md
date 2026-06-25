# Observability — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** needing to see inside the app in production. **Target:** Micrometer (metrics) + OpenTelemetry (traces) on Spring Boot.

**Why this matters:** When a request is slow or failing in prod, observability is the only way to answer *where* and *why* without guessing. The three pillars (logs, metrics, traces) are concepts you already have from Node — the delta is the Java toolchain and one hard rule: instrument as you build, not after the incident.

Move fast on what each pillar answers; spend the depth on trace-context propagation across async boundaries and on the cardinality/sampling decisions that quietly blow up cost.

## Depth tiers

### Core — learn deeply
- The three pillars and what each answers: **logs** = discrete events, **metrics** = aggregatable numbers over time, **traces** = the path of one request across services.
- **Metrics with Micrometer** (built into Spring via Actuator) → Prometheus → Grafana. It's a facade — like SLF4J for metrics — so you code to one API and swap the backend.
- **Tracing with OpenTelemetry (OTel)** — the cross-language standard. A trace = a tree of spans; each span carries a `traceId` + `spanId`. Spring Boot's `micrometer-tracing` bridge wires this in.
- **Trace-context propagation**: how the `traceId` rides along on outbound HTTP headers (W3C `traceparent`), and the part that bites — carrying it across async boundaries (the message broker, a Redis-backed job, a thread pool) so the trace doesn't break.
- **Structured logging with the trace ID stamped in** (cross-ref `standards/errors-and-logging.md`) so a log line links straight to its trace. MDC carries the IDs onto every log line.
- **Sampling** — you don't keep every trace. Head vs tail sampling, and why 100% in prod is a cost trap.

### Working knowledge
- Actuator endpoints (`/actuator/health`, `/metrics`, `/prometheus`) — know what they expose and how to lock them down.
- Alerting basics — alert on symptoms (error rate, latency SLOs) not on noise (CPU briefly at 80%).
- Log aggregation — Loki, or the ELK stack. Know the shape, not the operations.

### Awareness only
- APM vendors (Datadog, New Relic) — same three pillars, paid agents. The OTel SDK + collector replaces the proprietary agent.
- Exemplars / span links and the OTel Collector as a routing/processing hop.

### Skip — and why
- Hand-rolled correlation-ID filters and bespoke metrics registries — Micrometer + OTel + Spring autoconfiguration already do this; don't reinvent it.

## Node → Java delta

The pillars are identical; these are the things that are genuinely different in this stack.

- **Metrics are a first-class library, not `console.log` + a Prometheus scrape you wired yourself.** Micrometer ships with Boot and exposes counters/gauges/timers through Actuator out of the box.
- **One vendor-neutral standard.** Instead of a per-vendor SDK, OTel is the wire format and API; Micrometer Tracing bridges Spring spans onto it. Swap Jaeger for Tempo for Datadog without re-instrumenting.
- **Context propagation is explicit across threads.** Node's single event loop carries async context for you; on the JVM, real threads and pools mean the trace context must be *propagated* onto worker threads, broker consumers, and `@Async` tasks or the trace silently splits.
- **MDC over a request-scoped logger.** Trace/span IDs live in SLF4J's MDC (a thread-local map) and get pattern-printed on every log line — not threaded through function arguments.

## Learning objectives

After this you can:
- Explain what logs, metrics, and traces each answer, and which one to reach for first in an incident.
- Expose Micrometer metrics through Actuator and read them in Prometheus/Grafana.
- Follow one `traceId` from an inbound request, across an HTTP call and a broker hop, into the logs of a downstream service.
- Explain head vs tail sampling and pick a sane prod sampling rate.
- Name the boundaries where trace context breaks (thread pools, broker, Redis jobs) and how propagation restores it.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Turn on Actuator + the Prometheus endpoint; scrape it and chart request latency in Grafana.
- Add the OTel/Micrometer-tracing bridge; confirm a `traceId` appears in every log line via the log pattern.
- Add a custom Micrometer `Timer` around a service method and alert on its p99.
- Propagate the trace context across a message-broker hop so producer and consumer share one trace.
- Set a tail-sampling rule that keeps all error traces but samples successful ones at a low rate.

## Common pitfalls

- **Metric cardinality explosion** — putting a user ID, request ID, or URL with path params in a tag. Each unique value is a new time series; this is the #1 way to melt Prometheus.
- **Logging secrets/PII** — tokens, passwords, full request bodies in structured logs. They get aggregated, indexed, and retained.
- **100% trace sampling in prod** — full fidelity sounds great until the storage and egress bill (and the latency overhead) arrive. Sample.
- **Instrumenting only in prod** — if traces don't work locally, you'll debug the instrumentation during the incident. Run the collector locally too.
- **Dropping context across async boundaries** — broker consumers and pool threads start a fresh, parentless trace, so the request looks like two unrelated traces.

## Canonical resource

- OpenTelemetry documentation: https://opentelemetry.io/docs/

## Modern (2026)

- Learn **OpenTelemetry** specifically, not vendor-specific agents — it's the cross-language standard and decouples you from any one APM. Pair **Micrometer (metrics) + OTel (traces)**; on Spring Boot the `micrometer-tracing` bridge connects them.
- Prefer the **OTel SDK + Collector** over a proprietary APM agent; the Collector lets you process and route telemetry to any backend (Tempo, Jaeger, a vendor) without touching app code.

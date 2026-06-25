# Observability — curriculum

**Phase:** 1 · **Priority:** supporting · **Pulls in:** needing to see inside the app in production.

## Core — learn deeply

- The three pillars: logs, metrics, traces — what each answers.
- Metrics: Micrometer (built into Spring) → Prometheus → Grafana dashboards.
- Tracing: OpenTelemetry — the cross-language standard. Propagate a correlation/trace ID through a request.
- Structured logging with trace IDs (cross-ref `standards/errors-and-logging.md`); Actuator endpoints.

## Working knowledge

- Alerting basics (alert on symptoms, not noise); log aggregation (Loki, or the ELK stack) — awareness.

## Awareness only

- APM vendors (Datadog, New Relic) — same ideas, paid agents.

## Modern (2026)

- Learn OpenTelemetry specifically, not vendor-specific agents. Pair Micrometer (metrics) + OTel (traces).

## Sequence

- Add once the app is deployed and you need to debug it in the wild — not before there's something to observe.

# Portfolio project — note TEMPLATE (Phase 2)

**Phase:** 2 · **Priority:** template · **Use:** copy this file per portfolio project (one note each).

Phase 2 = small, polished, problem-specific projects built to industry standard, for interviews.
Quality over quantity — 2–3 polished projects beat 10 half-built ones. This is a **fill-in template**, not a topic: copy it per project, complete the fields, and let it drive the work. This is also where the deferred Phase-2 ceremony turns ON.

## Fill this in per project

- **Problem / domain:** <the real problem it solves — one sentence a non-engineer would understand>
- **Headline skill:** <the ONE thing it shows off, e.g. "high-write ingestion with Kafka + Cassandra". If you can't name one, the scope is wrong.>
- **Scope:** <deliberately small — one thing done excellently, not five things done halfway. Write down what is explicitly OUT of scope.>
- **Stack delta:** <what's genuinely new here vs the Phase-1 project — e.g. the chosen NoSQL store, a message broker, a cache. Everything else carries over so you can spend depth on the delta.>
- **Standards bar:** full `ai/standards/` apply, AND the heavier ceremony switches on now (see below).
- **Interview demo:** <what you'll show live + the tradeoffs you'll be ready to defend out loud>
- **Concepts deepened:** <slugs that get re-scored in state.json after this project>

## Standards bar — ceremony turns ON here

Phase 1 was about velocity; Phase 2 is about looking like a professional did it. Every project in this phase, no exceptions:

- **Feature branches** — no committing straight to the main branch. One branch per feature.
- **Pull requests** — open a PR even though you're the only reviewer; review your own diff before merge. The PR description is practice for explaining your work.
- **ADRs** — record the load-bearing decisions (see "When an ADR earns its place").
- **Clean README** — the outline below; a stranger should run it in under five minutes.
- **CI green** — build + tests + lint pass on every PR before merge. A red main branch is a red flag in an interview.

## What "done" looks like (success criteria)

Don't stop at "it works on my machine." Done means:

- The **headline skill is demonstrably exercised** — there's a path through the app (or a load test) that actually stresses the one thing this project is about.
- **Tests prove the interesting behavior**, not just the happy path — the edge case that justifies the design choice is covered (real Postgres/broker via Testcontainers, not mocks-of-everything).
- **CI is green** and the badge is in the README.
- **The README runs** — a fresh clone, the documented steps, and it's up.
- **Every load-bearing decision has an ADR** you could read aloud in an interview.
- It's **deployed or trivially deployable** — a `docker compose up` or a documented one-command path counts.

## Minimal README outline

1. **Problem** — what it solves and for whom, in two or three sentences.
2. **Architecture sketch** — one diagram or ASCII box-and-arrow; the components and the data flow. Link to the ADRs.
3. **Key tradeoffs** — the 2–3 decisions you'd defend in an interview and what you gave up for each.
4. **Run / deploy** — prerequisites, the one command to run locally, and how to deploy. Include the CI badge.
5. **What's intentionally out of scope** — names the boundaries so reviewers don't read absence as oversight.

## When a decision deserves an ADR

Write an ADR when a choice is **expensive to reverse, non-obvious, or you'll be asked "why" in an interview** — e.g. picking a NoSQL store over Postgres, choosing a messaging pattern, an auth model, a consistency/latency tradeoff. Keep it short: context → decision → consequences. Don't ADR the obvious (using JUnit, using Spring Boot) — those aren't decisions, they're the baseline. One crisp ADR per real fork in the road beats a folder of ceremony.

## Notes

- Each portfolio project lives in its **OWN repo** and gets its own copy of this note here.
- This is where the deferred big-tech ceremony (conventions §5) switches on — keep it on for the whole phase.

## Canonical resource

- Architecture Decision Records — what they are and templates: https://adr.github.io/

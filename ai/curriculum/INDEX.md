# Curriculum — master index

The planner reads THIS file to choose the next task, then opens the ONE topic file the task needs.
Plans are feature-based: you learn a topic because a feature requires it, never "study X" in the
abstract. The files are reference, not a queue.

## Phase 1 build order (the spine)

Build ONE project, breadth-first, roughly in this order. Each step pulls in its topic file:

1. java — language fundamentals (enough to be dangerous)
2. spring-boot + sql-postgres + api-design — first vertical feature, end to end
3. redis — cache the hot path
4. messaging — make a slow job async
5. docker — containerize the app + local stack
6. aws — deploy it
7. cicd — automate build / test / deploy
8. observability — see inside it in production
9. ai — add one AI feature last

testing applies to EVERY step (it's part of done), not a step of its own.

## Files

| File                 | Phase | Priority   | Pulls in (the feature/trigger that needs it) |
| -------------------- | ----- | ---------- | -------------------------------------------- |
| java.md              | 1     | core       | everything — foundational                    |
| spring-boot.md       | 1     | core       | the whole app                                |
| sql-postgres.md      | 1     | core       | any feature that stores data                 |
| api-design.md        | 1     | core       | any HTTP endpoint                            |
| testing.md           | 1     | core       | every task (definition of done)              |
| redis.md             | 1     | supporting | a hot read path, sessions, or rate limiting  |
| messaging.md         | 1     | supporting | a job that should run async / decoupling     |
| docker.md            | 1     | supporting | running the app + deps consistently          |
| aws.md               | 1     | supporting | deploying to the cloud                       |
| cicd.md              | 1     | supporting | automating build → test → deploy             |
| observability.md     | 1     | supporting | needing metrics/logs/traces in prod          |
| ai.md                | 1     | supporting | adding an LLM/RAG feature (last)             |
| nosql.md             | 2     | deep-dive  | a problem whose access pattern fits NoSQL    |
| portfolio-project.md | 2     | template   | copy per Phase-2 portfolio project           |

## Priority meaning

- core — learn deeply; daily work for a Java backend engineer.
- supporting — learn enough to build and explain it; don't go DBA/SRE deep.
- deep-dive / template — Phase 2, problem-specific.

## How each topic file is shaped

Every Phase-1 topic file follows the same shape, so you know where to look: a one-line *why*,
depth tiers (core / working knowledge / awareness / skip), the **Node → Java delta**, learning
objectives, a **task ladder** of example features, common pitfalls, and ONE canonical link.
The task ladder lists examples to pull when the project needs them — it is not a sequence to run
top to bottom. (`nosql.md` and `portfolio-project.md` are Phase-2 and shaped to their job.)

## Depth rule (applies to every file)

This learner already knows backend CONCEPTS from years of Node.js/TypeScript. Move fast on the
concept; spend the time on the JAVA/SPRING/AWS implementation and the delta from how Node does it.

## Currency

Targets as of mid-2026, verified against official docs: Java 21+ (Java 25 is the current LTS),
Spring Boot 4.x (keeps the Java 17+ baseline and the `jakarta.*` namespace), and Spring AI is GA.
The AI space moves fastest — trust current official docs over any version named here, especially
in `ai.md`.

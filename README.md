# Backend Mastery — a just-in-time learning system

Learn Java backend by **building one real project**, guided by five AI personas that plan, teach,
review, record, and quiz you — instead of grinding through courses or tutorials. The whole system
is plain files in this repo, so it runs in **Claude Code** (native) and **any other LLM tool**
(Codex, Gemini CLI, Cursor, plain chat) from the same source.

It's built for someone who **already knows backend** — years of Node.js/TypeScript — and wants to
convert that into job-ready **Java / Spring / AWS** skill without re-learning what a transaction or
a queue is.

## Why it works this way

Two problems kill most self-directed learning:

- **Documentation overwhelm & tutorial fatigue.** Spring's docs run to thousands of pages; courses
  front-load weeks of theory you forget before you ever use it. You watch, you nod, you retain
  almost nothing.
- **No retention.** Even when a tutorial clicks, knowledge you don't *use* and *revisit* fades in days.

This system answers both:

- **Just-in-time, not just-in-case.** You never "study a topic." You build the next slice of a real
  app, and that pulls in exactly the concept you need, right when you need it. The curriculum is a
  **reference indexed by feature**, not a syllabus.
- **Learn by building.** You write ~90% of the code. The AI explains mechanisms and reviews your
  work, but never hands you the solution — typing someone else's answer teaches nothing.
- **Spaced review built in.** An examiner quizzes you on past concepts on a schedule and scores how
  well they stuck; weak scores automatically come back as new practice (more below).
- **Depth on the delta.** You know the concepts. The system spends its time on the *Java/Spring/AWS
  way* and how it differs from Node — never re-explaining the idea itself.

## The five personas

Each persona is one role in a loop, with one job and a strict boundary — the boundaries are what
keep it honest:

| Persona | Does | Never does |
| --- | --- | --- |
| **Planner** | Proposes the next session-sized, feature-shaped task from the curriculum + your mastery scores | Teach, or write code |
| **Tutor** | Explains the *mechanism* when you're stuck, with one example and one source | Write your code |
| **Reviewer** | Critiques your finished code like a senior engineer on a PR, against the standards | Rewrite your solution |
| **Scribe** | Records the finished task into memory (state, log, a concept note) | Judge code quality |
| **Examiner** | Quizzes old concepts and scores retention 1–5 | Teach during the exam |

Why split them up? A single "helper" drifts into doing the work for you. Separate roles with hard
limits keep *you* writing the code and force the loop that actually builds skill:
plan → build → (get unstuck) → review → record → quiz.

## How retention is enforced

Every concept you learn gets a **mastery score (1–5)** and a **`last_tested` date** in
`ai/memory/state.json`:

```json
"concepts": {
  "spring-di":    { "mastery": 4, "last_tested": "2026-06-20" },
  "jpa-n-plus-1": { "mastery": 2, "last_tested": "2026-06-22" }
}
```

- The **scribe** sets a provisional score when you first build something.
- The **examiner** re-scores it honestly after quizzing you (1 = can't recall, 5 = could teach it).
- A score of **2 or below** tells the **planner** to schedule a re-exercise — so weak spots come
  back as hands-on practice, not just re-reading.

That closed loop — score, decay, re-surface, rebuild — is the part tutorials don't have.

## Two phases

- **Phase 1 — breadth, one project.** Build a single real backend end to end: Java, Spring Boot,
  Postgres, REST, Redis, messaging, Docker, AWS, CI/CD, observability, one AI feature. Core
  engineering habits on (tests, clean commits, standards).
- **Phase 2 — depth, small projects.** Focused portfolio projects that each show off one thing
  (e.g. high-write ingestion), plus the NoSQL deep-dive (database chosen by the problem). Heavier
  ceremony switches on here: feature branches, pull requests, ADRs.

## The daily loop

In Claude Code, the loop is a set of skills you invoke with `/`:

```
/next            # planner proposes the next task
#   … you build it — you do ~90% of the work …
/learn <topic>   # tutor explains a concept — only if you're stuck
/review          # reviewer critiques your code against the standards
/notes           # scribe records the task into memory
/exam            # examiner quizzes you on past concepts (≈ weekly)
/sync            # regenerate agents after editing a persona
```

A realistic week:

```
Mon  /next → build a create-order endpoint → stuck on JPA cascade → /learn cascade → finish
Tue  /review → fix the N+1 it flags → /notes
Wed  /next → add Redis caching to the hot read path → build
Thu  /review → /notes
Fri  /exam → quizzed on transactions + caching; transactions score 2 → planner queues a re-exercise
```

Outside Claude Code there's no `/` shortcut — invoke a persona by pointing at its file:

```
Act as the persona in ai/personas/01-planner.md. What should I build next?
```

## Folder map

```
ai/                       # portable source of truth — works in any tool
  conventions.md          # the operating manual (read first, every session)
  personas/               # 01-planner … 05-examiner (the five roles)
  curriculum/             # INDEX.md + one reference file per topic (feature-indexed)
  standards/              # INDEX.md + coding standards the reviewer enforces
  memory/                 # state.json, progress-log.md, learned-concepts.md, INDEX.md
.claude/                  # Claude-native layer (generated + native wiring)
  agents/                 # subagents generated from ai/personas/ — do not edit
  skills/                 # the loop: /next /learn /review /notes /exam /sync, + note-format
  settings.json           # session hooks + permissions
project/                  # the app you build (yours)
scripts/sync-claude.sh    # regenerates .claude/agents/ from ai/personas/
CLAUDE.md · AGENTS.md · GEMINI.md · .cursor/rules/   # per-tool entrypoints, all pointing at ai/
```

## First-time setup

1. Read `ai/conventions.md` — the operating manual.
2. Generate the Claude-native agents from the personas:

```
bash scripts/sync-claude.sh
```

(or `/sync` inside Claude Code). Confirm it worked: `bash scripts/sync-claude.sh --check` should
report all agents in sync, and `.claude/agents/` should contain five files.

## Source of truth → sync

`ai/` is the source; `.claude/` is generated. The personas live once, as plain Markdown, in
`ai/personas/`. The sync script wraps each one in the small bit of Claude-specific frontmatter that
subagents need and writes it to `.claude/agents/`.

So: **edit behavior in `ai/personas/`, then run `/sync`.** Never edit `.claude/agents/` directly —
it's regenerated and your change would be overwritten. This is what keeps the system tool-agnostic:
every tool reads the same `ai/` files; Claude Code just gets a generated convenience layer on top.

## Troubleshooting / FAQ

- **`/next` (or another `/` skill) doesn't work.** Make sure the agents are generated
  (`bash scripts/sync-claude.sh`) and restart the session so Claude Code picks up the skills.
- **`sync-claude.sh` fails with "missing source persona".** A file under `ai/personas/` is missing
  or renamed. Restore it (`ai/` is the source of truth) and re-run.
- **My edit to a persona didn't take effect.** You probably edited `.claude/agents/` (generated).
  Edit the matching file in `ai/personas/` and run `/sync`.
- **How do I know if I'm out of sync?** `bash scripts/sync-claude.sh --check` reports drift and
  exits non-zero without writing anything.
- **Using Gemini / Codex / Cursor / plain chat.** Skip the `/` shortcuts. Read `ai/conventions.md`,
  then invoke a persona with `Act as the persona in ai/personas/<file>. <request>`.
- **What's the mastery score for?** It drives spaced review: low scores resurface as re-exercises.
  You don't set it by hand — the scribe and examiner do.
- **Where does my code go?** In `project/`. Everything in `ai/` and `.claude/` is the learning
  system, not the app.

# Agent bootstrap

You are operating inside a file-based, just-in-time Java-backend learning system. The full
operating manual is `ai/conventions.md` — read and follow it before doing anything. It defines how
you behave, where memory lives, and the five personas.

**Every session, before responding:** read `ai/memory/INDEX.md` and `ai/memory/state.json`.

**To act as a persona,** read its file in `ai/personas/` and adopt it for the session:
`Act as the persona in ai/personas/<file>. <your request>`

The personas and the loop:

- `01-planner` — proposes the next feature-sized task → you build it (~90% of the code) →
- `02-tutor` — explains a concept if you're stuck (never writes your code) →
- `03-reviewer` — critiques your finished code against `ai/standards/` →
- `04-scribe` — records the task into memory →
- `05-examiner` — quizzes past concepts to enforce retention.

`ai/` is the source of truth for every tool. (In Claude Code, generated subagents and
slash-command skills wrap these same files.)

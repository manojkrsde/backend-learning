# Project bootstrap

The full operating manual is `ai/conventions.md` — read it and follow it before acting.

## How to operate here

- `ai/` is the portable source of truth (used by other tools too).
- `.claude/` is the native layer. Use the subagents in `.claude/agents/` and the loop
  skills instead of pasting persona files — same roles, far less context per turn.
- Personas → subagents: planner, tutor, reviewer, scribe, examiner.
- Loop skills (in `.claude/skills/`, type `/`): /next /learn /review /notes /exam /sync.
- ALWAYS read `ai/memory/INDEX.md` and `ai/memory/state.json` before responding.

## Source-of-truth rule

Edit persona content in `ai/personas/`, then run `/sync` (or `scripts/sync-claude.sh`)
to regenerate `.claude/agents/`. Never edit `.claude/agents/` directly — it's generated.

## Committing

- Follow the commit conventions in `ai/standards/git.md` (Conventional Commits,
  one logical change per commit).
- Do NOT add a `Co-Authored-By` trailer or any AI/Claude attribution to commit messages.

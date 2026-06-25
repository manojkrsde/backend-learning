# Backend Mastery — a just-in-time learning system

Learn Java backend by BUILDING ONE real project, with AI personas that plan, teach, review,
record, and quiz you — instead of courses or tutorials. Works in Claude Code (native) and any
other LLM tool (Codex, Gemini CLI, Cursor, plain chat) from the same files.

## First-time setup

1. Read `ai/conventions.md` — the operating manual.
2. Generate the Claude-native agents from the personas:

```
   bash scripts/sync-claude.sh
```

(or run `/sync` inside Claude Code)

## The loop

- `/next` — get the next task
- build it yourself (you do ~90% of the work)
- `/learn <concept>` — only if you're stuck
- `/review` — senior-style review against the standards
- `/notes` — record what you learned into memory
- `/exam` — weekly, to keep knowledge from fading

On any other tool: `Act as the persona in ai/personas/<file>. <your request>`

## Layout

- `ai/` — portable source of truth (conventions, standards, personas, curriculum, memory)
- `.claude/` — Claude-native layer (generated agents, slash commands, skills, settings + hooks)
- `project/` — the code you build
- `scripts/sync-claude.sh` — regenerates `.claude/agents/` from `ai/personas/`

Edit behavior in `ai/`, never in `.claude/agents/` (it's generated). After editing a persona, run `/sync`.

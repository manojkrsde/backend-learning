#!/usr/bin/env bash
set -euo pipefail

# Regenerate .claude/agents/ from ai/personas/ (the single source of truth).
# Personas are plain Markdown; this wraps each one with the subagent frontmatter
# Claude Code needs. Edit personas in ai/personas/, then run this (or /sync).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/ai/personas"
OUT="$ROOT/.claude/agents"

mkdir -p "$OUT"

emit() {
  local stem="$1" name="$2" desc="$3" tools="$4"
  local src="$SRC/$stem.md"
  local dest="$OUT/$name.md"
  if [ ! -f "$src" ]; then
    echo "skip: $src not found"
    return
  fi
  {
    echo "---"
    echo "name: $name"
    echo "description: $desc"
    echo "tools: $tools"
    echo "---"
    echo
    echo "<!-- GENERATED from ai/personas/$stem.md by scripts/sync-claude.sh — do not edit here. -->"
    echo
    cat "$src"
  } > "$dest"
  echo "wrote $dest"
}

#     persona-file   agent-name  description (drives auto-invoke)                                                        tools
emit "01-planner"  "planner"  "Proposes the next learning task from curriculum and memory. Use to decide what to build next." "Read, Edit"
emit "02-tutor"    "tutor"    "Explains a concept without writing the user's code. Use when the user is stuck on how something works." "Read, WebFetch"
emit "03-reviewer" "reviewer" "Reviews finished code against the standards like a senior engineer. Use after code is written for a task." "Read, Bash"
emit "04-scribe"   "scribe"   "Records a finished session into memory (state, log, concept note). Use when a task passes review." "Read, Edit, Write"
emit "05-examiner" "examiner" "Quizzes past concepts and scores retention into state.json. Use periodically, e.g. weekly." "Read, Edit"

echo "done: regenerated $(find "$OUT" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ') agents in .claude/agents/"
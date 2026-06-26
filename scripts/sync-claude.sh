#!/usr/bin/env bash
set -euo pipefail

# Regenerate .claude/agents/ from ai/personas/ (the single source of truth).
#
# Personas are plain Markdown so every tool can read them. This script wraps each
# one with the subagent frontmatter Claude Code needs and writes it to .claude/agents/.
# Edit personas in ai/personas/, then run this (or /sync). Never edit .claude/agents/
# by hand — it is generated and will be overwritten.
#
# Contract: ai/personas/<stem>.md is the source. The mapping below (stem -> name,
# description, tools) is the ONLY place agent metadata lives. The generated file format
# is stable; re-running is idempotent (unchanged agents are left untouched).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/ai/personas"
OUT="$ROOT/.claude/agents"

# Valid Claude Code tool names. A typo in the mapping (e.g. "Rad") would silently
# produce a broken agent, so we reject anything not on this list.
ALLOWED_TOOLS="Read Edit Write Bash WebFetch WebSearch Glob Grep"

EXPECTED=6          # number of personas we expect to emit
CHECK=0             # 1 = dry run (--check)

ok=0; written=0; drift=0; missing=0

info() { printf '%s\n' "$*"; }
err()  { printf 'sync-claude: error: %s\n' "$*" >&2; }

usage() {
  cat <<'EOF'
Usage: sync-claude.sh [--check] [--help]

Regenerate .claude/agents/ from ai/personas/ (the single source of truth).
Each persona is wrapped with the subagent frontmatter Claude Code needs.

Options:
  --check, -n   Dry run. Report which agents are missing or out of date and exit
                non-zero if any are, WITHOUT writing. Use in CI or a pre-commit hook.
  --help,  -h   Show this help and exit.

Edit personas in ai/personas/, then run this (or /sync) to regenerate.
EOF
}

# Reject unknown tool names early — they fail only at agent-invocation time otherwise.
validate_tools() {
  local tools="$1" stem="$2" raw t
  local arr=()
  IFS=',' read -ra arr <<< "$tools"
  for raw in "${arr[@]}"; do
    t="${raw//[[:space:]]/}"
    [ -z "$t" ] && continue
    case " $ALLOWED_TOOLS " in
      *" $t "*) ;;
      *) err "persona '$stem': unknown tool '$t' (allowed: $ALLOWED_TOOLS)"; return 1 ;;
    esac
  done
}

# Defensive check that what we are about to write is a well-formed agent file.
validate_frontmatter() {
  local f="$1" stem="$2"
  head -n 1 "$f" | grep -qx -- '---'      || { err "$stem: generated file is missing the opening '---'"; return 1; }
  grep -qE '^name: .+'        "$f"         || { err "$stem: generated file is missing 'name:'"; return 1; }
  grep -qE '^description: .+' "$f"         || { err "$stem: generated file is missing 'description:'"; return 1; }
  grep -qE '^tools: .+'       "$f"         || { err "$stem: generated file is missing 'tools:'"; return 1; }
}

# Emit the full agent file (frontmatter + generated-marker + persona body) to stdout.
# Kept byte-for-byte stable so --check and re-runs are meaningful.
render() {
  local stem="$1" name="$2" desc="$3" tools="$4"
  printf -- '---\n'
  printf 'name: %s\n' "$name"
  printf 'description: %s\n' "$desc"
  printf 'tools: %s\n' "$tools"
  printf -- '---\n\n'
  printf '%s\n\n' "<!-- GENERATED from ai/personas/$stem.md by scripts/sync-claude.sh — do not edit here. -->"
  cat "$SRC/$stem.md"
}

emit() {
  local stem="$1" name="$2" desc="$3" tools="$4"
  local src="$SRC/$stem.md" dest="$OUT/$name.md" tmp

  if [ ! -f "$src" ]; then
    err "missing source persona: $src"
    err "cannot generate $name.md. Restore the persona (ai/ is the source of truth) and retry."
    exit 1
  fi
  if [ -z "$name" ] || [ -z "$desc" ] || [ -z "$tools" ]; then
    err "persona '$stem': empty name/description/tools in the mapping (check sync-claude.sh)."
    exit 1
  fi
  validate_tools "$tools" "$stem" || exit 1

  tmp="$(mktemp)"
  render "$stem" "$name" "$desc" "$tools" > "$tmp"
  validate_frontmatter "$tmp" "$stem" || { rm -f "$tmp"; exit 1; }

  if [ "$CHECK" -eq 1 ]; then
    if [ ! -f "$dest" ]; then
      info "MISSING  $name.md (would create)"; missing=$((missing + 1))
    elif cmp -s "$tmp" "$dest"; then
      info "ok       $name.md (unchanged)";     ok=$((ok + 1))
    else
      info "DRIFT    $name.md (would update)";   drift=$((drift + 1))
    fi
    rm -f "$tmp"
  else
    if [ -f "$dest" ] && cmp -s "$tmp" "$dest"; then
      info "ok       $name.md (unchanged)"; ok=$((ok + 1)); rm -f "$tmp"
    else
      mv "$tmp" "$dest"; info "wrote    $name.md"; written=$((written + 1))
    fi
  fi
}

# --- parse args ---
while [ $# -gt 0 ]; do
  case "$1" in
    --check|-n) CHECK=1 ;;
    --help|-h)  usage; exit 0 ;;
    *) err "unknown argument: $1"; echo; usage >&2; exit 2 ;;
  esac
  shift
done

if [ "$CHECK" -eq 1 ]; then
  info "sync-claude: --check (dry run; no files will be written)"
else
  info "sync-claude: regenerating agents from $SRC"
  mkdir -p "$OUT"
fi

#     persona-file   agent-name  description (drives auto-invoke)                                                          tools
emit "01-planner"  "planner"  "Proposes the next learning task from curriculum and memory. Use to decide what to build next." "Read, Edit"
emit "02-tutor"    "tutor"    "Explains a concept without writing the user's code. Use when the user is stuck on how something works." "Read, WebFetch"
emit "03-reviewer" "reviewer" "Reviews finished code against the standards like a senior engineer. Use after code is written for a task." "Read, Bash"
emit "04-scribe"   "scribe"   "Records a finished session into memory (state, log, concept note). Use when a task passes review." "Read, Edit, Write"
emit "05-examiner" "examiner" "Quizzes past concepts and scores retention into state.json. Use periodically, e.g. weekly." "Read, Edit"
emit "06-briefer"  "briefer"  "Writes a full, human-friendly task brief to ai/memory/tasks/<id>.md from the current task. Use right after a task is planned." "Read, Write, Edit"

# --- summary + invariants ---
total=$((ok + written + drift + missing))
if [ "$total" -ne "$EXPECTED" ]; then
  err "expected $EXPECTED agents, processed $total — the emit list and EXPECTED are out of sync."
  exit 1
fi

if [ "$CHECK" -eq 1 ]; then
  if [ $((drift + missing)) -gt 0 ]; then
    err "out of sync: $drift would change, $missing would be created."
    err "run: bash scripts/sync-claude.sh"
    exit 1
  fi
  info "in sync: all $EXPECTED agents match their source personas."
else
  info "done: $written written, $ok unchanged — $EXPECTED agents in .claude/agents/"
fi

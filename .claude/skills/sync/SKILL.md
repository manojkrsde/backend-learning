---
name: sync
description: Regenerate .claude/agents from ai/personas (run after editing a persona).
allowed-tools: Bash(bash scripts/sync-claude.sh:*), Bash(./scripts/sync-claude.sh:*)
disable-model-invocation: true
---

Regenerate the Claude-native agents from the source personas:

!`bash scripts/sync-claude.sh`

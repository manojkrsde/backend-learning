---
name: brief
description: Write or refresh the full human-friendly brief for the current task into ai/memory/tasks/<id>.md.
argument-hint: "[optional task id, defaults to current_task]"
disable-model-invocation: true
---

Use the briefer subagent to write the full task brief. Target task: $ARGUMENTS (if empty, brief the
`current_task` in `ai/memory/state.json`). The brief goes to `ai/memory/tasks/<id>.md` and the
INDEX is updated to list it.

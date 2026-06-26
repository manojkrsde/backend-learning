---
name: next
description: Propose the next learning task from curriculum and memory. Run to decide what to build next.
argument-hint: "[optional focus area, e.g. spring]"
disable-model-invocation: true
---

Use the planner subagent to propose the next task. If provided, focus on: $ARGUMENTS

Once the user accepts and `current_task` is set in `state.json`, use the briefer subagent to write
the full human-friendly brief to `ai/memory/tasks/<id>.md` (same as the `/brief` skill). A planned
task isn't ready to build until its brief exists.

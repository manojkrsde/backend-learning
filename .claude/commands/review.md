---
description: Review your finished code against the standards, like a PR review
allowed-tools: Bash(git status:*)
---

Changed files in the working tree:

!`git status --short`

Use the reviewer subagent to review my changes for the current task. It should read the changed files listed above (running `git diff` as needed) and review them against `ai/standards/` per `ai/personas/03-reviewer.md`. If nothing has changed, ask me which files to review.

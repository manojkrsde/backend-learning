# Memory — index

Read this first, then read ONLY the file or note it points you to. Never load everything —
that's what keeps token cost low.

## Files here

- `state.json` — current task, completed task ids, concept mastery. Read EVERY session.
- `progress-log.md` — append-only history of finished tasks.
- `learned-concepts.md` — your concept notes, written in the note-format. Index of notes is below.

## state.json — shape (for reference only; the real file starts empty)

`current_task` is null when nothing is active; the planner sets it to an object.
Mastery is 1–5; a score of 2 or below tells the planner to schedule a re-exercise.

```json
{
  "current_task": {
    "id": "t-003",
    "title": "Add a cancel-order endpoint",
    "concepts": ["spring-transactional", "rest-status-codes"]
  },
  "completed_task_ids": ["t-001", "t-002"],
  "concepts": {
    "spring-di": { "mastery": 4, "last_tested": "2026-06-20" },
    "jpa-n-plus-1": { "mastery": 2, "last_tested": "2026-06-22" }
  }
}
```

## Concept notes in learned-concepts.md

(none yet — the scribe adds one line here, by Key, for each note it writes)

## Completed work

(none yet — see progress-log.md once tasks are done)

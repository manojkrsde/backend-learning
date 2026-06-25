# Standards — index

Detailed coding standards the reviewer enforces and the user writes code against.
Do NOT load every file. Read this index, then load only the file(s) the current task touches.

- `java-style.md` — writing or reviewing any Java code
- `api.md` — designing or reviewing an HTTP endpoint
- `persistence.md` — touching the database, JPA entities, or transactions
- `errors-and-logging.md` — handling errors, validation, or logging
- `testing.md` — writing or reviewing tests
- `security.md` — handling auth, input, secrets, or user data
- `git.md` — committing work

## Routing by task (load these together)

- New HTTP endpoint → `api.md` + `errors-and-logging.md` + `testing.md` (add `security.md` if it
  touches auth or user data).
- Database work / a new entity → `persistence.md` + `testing.md` + `security.md`.
- Any Java at all → `java-style.md` is always in scope.
- Committing → `git.md`.

These rules apply to Phase 1. Heavier team process (branches, PRs, ADRs) is deferred per
`ai/conventions.md`. If a rule conflicts with current official docs, trust the docs and say so.

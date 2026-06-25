# Git & commits (core habits)

## Commits

- Commit small and often: one commit = one logical, working change. Don't bundle unrelated changes.
- Use Conventional Commits: `<type>(<scope>): <summary>`.
  Types: feat, fix, refactor, test, docs, chore, perf, build.
  Example: `feat(order): add cancel-order endpoint`
- Summary in imperative mood, lower-case, no trailing period, under ~72 chars. Add a body explaining
  WHY when it isn't obvious.
- Don't commit commented-out code, debug prints, or generated/build files.

## Hygiene

- Keep a real `.gitignore` (build output, `.env`, `settings.local.json`, IDE files). Never commit
  secrets — if one slips in, rotate it, don't just delete the line.
- Keep the build green: don't commit code that doesn't compile or whose tests fail.

## For later (deferred per conventions §5)

- Short-lived feature branches named `type/short-description` (e.g. `feat/order-cancel`), pull
  requests, and review by others come once these habits are automatic. Until then, commit discipline
  on the main line is enough.

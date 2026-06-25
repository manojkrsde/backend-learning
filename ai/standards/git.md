# Git & commits (core habits)

Independently loadable. This file covers commit discipline and repo hygiene only — not branching
strategy or review process (deferred; see bottom). Spring Boot 4.x / Java 17+ context, but nothing
here is version-specific.

## Commits

- Commit small and often: one commit = one logical, working change. Don't bundle unrelated changes.
- Use Conventional Commits: `<type>(<scope>): <summary>`.
  Types: feat, fix, refactor, test, docs, chore, perf, build.
  Example: `feat(order): add cancel-order endpoint`
- Summary in imperative mood, lower-case, no trailing period, under ~72 chars. Add a body explaining
  WHY when it isn't obvious.
- Don't commit commented-out code, debug prints, or generated/build files.

### One commit = one logical change

The single highest-leverage habit. A commit is a unit of *intent*, not a unit of *time*. If the
summary needs "and" or is vague ("fix stuff", "updates", "wip"), you bundled too much.

```
bad:  git commit -am "fix stuff"
      # 14 files: a real bug fix, a rename, a new endpoint, and reformatting — all tangled
good: fix(payment): prevent double-charge on retry
      # one logical change: the retry guard and its test, nothing else
```

The "good" commit maps to exactly one decision in the code. The intent is in the message, and the
diff is small enough to confirm it does only that:

```java
// the whole change behind "fix(payment): prevent double-charge on retry"
public PaymentResult charge(ChargeRequest req) {
    if (ledger.existsByIdempotencyKey(req.idempotencyKey())) {   // the one guard added
        return ledger.findByIdempotencyKey(req.idempotencyKey()).toResult();
    }
    return gateway.charge(req);
}
```

Why it costs at scale: `git revert` and `git bisect` operate on whole commits. A commit that mixes a
bug fix with a rename and reformatting can't be reverted without losing the rename, and bisect will
finger a 14-file commit instead of a one-line guard — turning a five-minute root-cause into an hour.

### Type and scope, concretely

The `<type>` is the *kind* of change, not the subsystem; the `<scope>` is the subsystem. Reviewers
and changelog tooling read the type, so don't lie with it.

```
bad:  feat(order): rename OrderSvc to OrderService     // a rename is not a feature
bad:  fix: bump jackson to 2.18, add discount field    // two changes, wrong type for both
good: refactor(order): rename OrderSvc to OrderService
good: build(deps): bump jackson to 2.18.2
good: feat(order): add percentage discount to line items
```

Why it costs at scale: automated changelogs and semver bumps key off the type — a `feat:` triggers a
minor release, a `fix:` a patch. Mislabel a breaking refactor as `fix:` and you ship a breaking
change under a patch version, and every consumer who trusted semver breaks on `mvn`/Gradle upgrade.

### Subject line mechanics

Imperative mood ("add", not "added"/"adds"), lower-case after the colon, no trailing period. The
test: the summary should complete the sentence "If applied, this commit will ___".

```
bad:  fix(auth): Fixed the bug where tokens expired early.
good: fix(auth): refresh token 60s before expiry to avoid mid-request 401
```

Put the WHY in the body when it isn't obvious from the diff — future-you debugging at 2am reads the
body, not your memory.

## Hygiene

- Keep a real `.gitignore` (build output, `.env`, `settings.local.json`, IDE files). Never commit
  secrets — if one slips in, rotate it, don't just delete the line.
- Keep the build green: don't commit code that doesn't compile or whose tests fail.

### A real .gitignore (Java/Spring/Maven or Gradle)

The Node instinct is to ignore `node_modules/`. The Java equivalents are build output and IDE
metadata — and they are bigger and more numerous, so an absent `.gitignore` here is louder.

```
# build output — regenerated, never committed
target/        # Maven
build/         # Gradle
*.class

# secrets & local config — never committed
.env
application-local.properties
settings.local.json

# IDE / OS noise
.idea/
*.iml
.vscode/
.DS_Store
```

Why it costs at scale: committing `target/` puts thousands of compiled `.class` files in history,
balloons clone size permanently (git history is forever), and produces merge conflicts in artifacts
nobody edits by hand.

### Secrets: rotate, don't just delete

A secret committed once lives in history forever — deleting the line in a later commit leaves it one
`git log -p` away. The line in the file is the *symptom*; the leaked value is the *incident*.

```
bad:  edit application.properties to remove the key, commit "fix: remove password"
      # the password is still in the previous commit, readable by anyone with the repo
good: rotate the credential at its source (DB/cloud/API) so the leaked value is now dead,
      THEN remove it from the working tree and move it to an env var
```

Spring delta: prefer externalized config — read secrets from environment variables
(`${DB_PASSWORD}` in `application.properties`) or a secrets manager, never hard-coded literals or
checked-in `application-*.properties`. (Spring Cloud Config / Vault integration specifics: verify
against current docs — knowledge ~early 2026.)

Why it costs at scale: assuming "I deleted it" closes the incident is how breaches happen. The cost
isn't the commit; it's the window between leak and rotation, which a deleted line silently extends.

### Keep the build green

Don't commit code that doesn't compile or whose tests fail. On a shared main line, a red commit
blocks everyone who pulls it and corrupts `git bisect` (it can't tell *your* bug from *your build
break*). Run the build and tests locally before committing.

## For later (deferred per conventions §5)

These are explicitly out of scope for Phase 1 — do not adopt them yet, and the reviewer should not
flag their absence:

- **Feature branches** named `type/short-description` (e.g. `feat/order-cancel`).
- **Pull requests** and review-by-others as a gate before merge.
- **ADRs** (Architecture Decision Records) for recording significant design decisions.

Until commit discipline above is automatic, committing carefully on the main line is enough. Adopt
branches/PRs/ADRs in Phase 2 when collaborating with others.

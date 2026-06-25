# Coding style — Java

## Naming

- Classes/interfaces: PascalCase nouns (`OrderService`). No `I` prefix on interfaces.
- Methods: camelCase verbs (`calculateTotal`). Booleans read as questions (`isActive`, `hasAccess`).
- Constants: UPPER_SNAKE_CASE. Variables: camelCase, descriptive, no cryptic abbreviations.
- Packages: lowercase, grouped BY FEATURE not by layer (`com.app.order`, not `com.app.controllers`).

## Structure

- One public class per file. Organize packages by feature/domain — each feature folder holds
  its own controller, service, and repository. This is what keeps a large codebase navigable.
- Keep methods short; if a method doesn't fit on one screen, split it. One method, one job.
- A class should have one reason to change.

## Immutability & nulls

- Prefer immutable objects. Use `record` for DTOs and value types.
- Make fields `final` where possible and use constructor injection (also makes testing easy).
- Never return `null` for a collection — return an empty one. Use `Optional<T>` only as a
  return type for "may be absent"; never for fields or method parameters.

## Modern Java (target 21+, ideally 25 LTS)

- Use records, sealed classes, switch pattern matching, text blocks, and `var` for obvious locals.
- Prefer the Stream API for transformations, but a plain loop is fine when it reads clearer.
- For blocking I/O concurrency, prefer virtual threads over hand-rolled thread pools. Reach for
  reactive (WebFlux) only with a concrete reason.
- Spring Boot 3 uses the `jakarta.*` namespace, never `javax.*` — the #1 breakage from old tutorials.

## Formatting & analysis

- Auto-format with Spotless (Google Java Format). Never hand-format.
- Run static analysis (Checkstyle / SpotBugs / Error Prone or IDE inspections) and fix warnings,
  don't suppress them.

## Comments

- Code says HOW; comments say WHY. Don't comment the obvious.
- Javadoc public APIs (the contract), not implementation detail. Delete dead code — don't comment it out.

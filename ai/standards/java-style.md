# Coding style — Java

Baseline: Java 17+, Spring Boot 4.x, `jakarta.*` (never `javax.*`). Examples target modern Java
(records, sealed types, switch patterns). If a version detail looks off, trust current docs.

## Naming

- Classes/interfaces: PascalCase nouns (`OrderService`). No `I` prefix on interfaces.
- Methods: camelCase verbs (`calculateTotal`). Booleans read as questions (`isActive`, `hasAccess`).
- Constants: UPPER_SNAKE_CASE. Variables: camelCase, descriptive, no cryptic abbreviations.
- Packages: lowercase, grouped BY FEATURE not by layer (`com.app.order`, not `com.app.controllers`).

Coming from TS: there is no `IFoo`/`FooImpl` ceremony culture here. Name the interface for the
role (`PaymentGateway`) and the implementation for the mechanism (`StripePaymentGateway`).

## Structure — package by FEATURE, not by layer

- One public class per file. Organize packages by feature/domain — each feature folder holds
  its own controller, service, and repository. This is what keeps a large codebase navigable.
- Keep methods short; if a method doesn't fit on one screen, split it. One method, one job.
- A class should have one reason to change.

```text
bad  (by layer):              good (by feature):
com.app.controllers           com.app.order        // OrderController, OrderService, OrderRepo
com.app.services              com.app.payment      // PaymentController, PaymentService...
com.app.repositories          com.app.shipping
```

Why it costs at scale: by-layer means one feature change edits four sibling packages and a reviewer
can't see the feature's surface in one place; by-feature lets you make a package boundary (or later,
a module) the unit of ownership and even tighten visibility to package-private within it.

## Immutability & null discipline

- Prefer immutable objects. Use `record` for DTOs and value types.
- Make fields `final` where possible and use constructor injection (also makes testing easy).
- Never return `null` for a collection — return an empty one. Use `Optional<T>` only as a
  return type for "may be absent"; never for fields or method parameters.

Constructor injection over field injection — this is the one that quietly rots a codebase:

```java
// bad: hidden deps, needs reflection or a running context to test
@Autowired private OrderRepo repo;

// good: deps are explicit, field is final, trivially unit-testable with `new`
private final OrderRepo repo;
OrderService(OrderRepo repo) { this.repo = repo; }   // @Autowired optional on a sole ctor
```

Why it costs at scale: field injection lets a class silently accrete hidden dependencies until the
wiring graph is untestable and a "small" class secretly pulls in half the container.

Records for DTOs/value objects — don't hand-roll a mutable bean for data in transit:

```java
// bad: mutable, 40 lines of getters/setters/equals/hashCode, can be half-constructed
public class OrderDto { private Long id; public void setId(Long id){...} /* ... */ }

// good: immutable, value-based equals/hashCode/toString for free, complete at construction
public record OrderDto(Long id, String sku, int qty) {}
```

Why it costs at scale: mutable beans get mutated by accident across layers; an immutable record is
safe to pass around, cache, and reason about concurrently. (Records are not JPA entities — see
`persistence.md`; use them for DTOs and value objects, not for the @Entity itself.)

Null discipline — make absence a type, not a landmine:

```java
// bad: caller has no signal this can be null; one missing check = NPE in prod
public Order find(Long id) { return repo.findById(id).orElse(null); }

// good: absence is in the signature; caller is forced to handle it
public Optional<Order> find(Long id) { return repo.findById(id); }
```

Why it costs at scale: a `null` returned from one method propagates until it NPEs three calls away
from the cause; `Optional` (return type only) moves the decision to the one place that has context.

## Modern Java (records, sealed types, switch patterns)

- Use records, sealed classes, switch pattern matching, text blocks, and `var` for obvious locals.
- Prefer the Stream API for transformations, but a plain loop is fine when it reads clearer.
- For blocking I/O concurrency, prefer virtual threads over hand-rolled thread pools. Reach for
  reactive (WebFlux) only with a concrete reason — it costs you stack traces and debuggability.

Sealed types + switch patterns make illegal states unrepresentable and exhaustiveness checked:

```java
sealed interface Payment permits Card, Bank, Wallet {}
// good: no `default` needed; adding a permit makes this fail to compile until handled
String describe(Payment p) {
    return switch (p) {
        case Card c -> "card ****" + c.last4();
        case Bank b -> "bank " + b.iban();
        case Wallet w -> "wallet " + w.id();
    };
}
```

Why it costs at scale: an `if/else` chain on `instanceof` (the TS `switch (kind)` habit) silently
does nothing for a new subtype; a sealed + exhaustive `switch` turns that into a compile error.

`jakarta.*`, not `javax.*` — the #1 breakage when copying old tutorials. Spring Boot 4.x is fully on
the Jakarta namespace; any import of `javax.persistence`, `javax.validation`, or `javax.servlet` is
a Spring Boot 2-era artifact and will not resolve.

## Formatting & analysis

- Auto-format with Spotless (Google Java Format). Never hand-format — formatting is not a code review
  topic. Wire it into the build so CI fails on drift; don't rely on people remembering.
- Run static analysis (Checkstyle / SpotBugs / Error Prone or IDE inspections) and fix warnings,
  don't suppress them. A `@SuppressWarnings` without a comment explaining why is a code smell.

## Comments

- Code says HOW; comments say WHY. Don't comment the obvious.
- Javadoc public APIs (the contract), not implementation detail. Delete dead code — don't comment it out.

```java
// bad: restates the code, adds nothing, rots when the line changes
i++; // increment i

// good: explains a non-obvious WHY the code itself can't state
// Stripe rounds half-up; we match it here so reconciliation doesn't drift by a cent.
amount = amount.setScale(2, RoundingMode.HALF_UP);
```

Why it costs at scale: obvious comments train readers to ignore all comments, so the one comment that
encodes a hard-won "why" gets skimmed past too.

# Errors & logging

> Java/Spring delta from Node/TS: there are no checked-exception equivalents in JS, so
> Java forces a decision at every `throws` boundary. Spring's `@ControllerAdvice` is the
> centralized error middleware you'd hand-roll in Express. Logging is SLF4J (a facade like
> a logger interface), not `console.log`. Spring Boot 4.x, Java 17+, `jakarta.*` (not `javax.*`).

## Exceptions

- Fail fast: validate at the boundary and throw early with a clear message.
- Use unchecked exceptions (extend `RuntimeException`) for unexpected/programming errors; define a
  small set of meaningful domain exceptions (e.g. `OrderNotFoundException`).
- Never swallow an exception (empty catch). Handle it meaningfully or let it propagate.
- Don't log-and-rethrow at every layer — log once, where it's actually handled.
- Catch specific exceptions, not `Exception`/`Throwable`, except at a top-level boundary.
- Don't use exceptions for control flow that isn't exceptional (e.g. "row not found" on an
  optional lookup is an `Optional`, not a thrown exception).

Catch-and-swallow hides the failure; the request returns a wrong-but-200 result and you debug it blind weeks later.

```java
// bad: swallows the cause — caller sees an empty result and no signal anything broke
try { return repo.findById(id); }
catch (DataAccessException e) { return Optional.empty(); }

// good: let it propagate to the boundary, OR translate to a domain exception with context
return repo.findById(id)
    .orElseThrow(() -> new OrderNotFoundException("order " + id + " not found"));
```

Log-once vs log-at-every-layer: rethrow-and-log at each catch produces N stack traces for one failure, so your error count and alerts are inflated by a factor of however many layers the call passed through.

```java
// bad: same error logged 3 times as it bubbles up — noise, false alert volume
catch (PaymentException e) { log.error("payment failed", e); throw e; }

// good: add context as it propagates, log exactly once at the handler/boundary
catch (PaymentException e) { throw new OrderFailedException("order " + id, e); }
```

Domain exceptions carry an HTTP intent so the boundary can map them without `instanceof` chains.

```java
// good: a small, meaningful domain type — the handler maps it to 404 in one place
public class OrderNotFoundException extends RuntimeException {
  public OrderNotFoundException(String message) { super(message); }
}
```

## Validation

- Validate request DTOs with Bean Validation annotations (`@NotNull`, `@Email`, `@Size`, …) plus
  `@Valid`/`@Validated` on the parameter. These are `jakarta.validation.*` in Spring Boot 4.x.
- Validate at the edge (controller), so bad input never reaches the service or DB.
- Handle violations in one place (the `@ControllerAdvice`) and return a structured error — never let
  the raw framework error shape leak to clients.

Validate at the edge, not inside business logic — manual `if` checks scattered in services drift out of sync and skip fields nobody remembered to guard.

```java
// bad: manual checks deep in the service, easy to forget a field, no machine-readable error
void create(OrderDto dto) {
  if (dto.email() == null) throw new IllegalArgumentException("email required");
  // ... qty never checked
}

// good: declare constraints on the DTO; @Valid rejects bad input before the method runs
public record OrderDto(@NotNull @Email String email, @Positive int qty) {}

@PostMapping("/orders")
Order create(@Valid @RequestBody OrderDto dto) { return service.create(dto); }
```

Why it costs at scale: edge validation means every endpoint enforces the same contract for free; ad-hoc checks mean each new caller path is a fresh chance to admit garbage into the database.

## API errors

- Translate exceptions to HTTP in a single `@ControllerAdvice` / `@ExceptionHandler`, not scattered
  try/catch in controllers.
- Return **RFC 9457 `ProblemDetail`** (the `application/problem+json` standard; RFC 9457 obsoletes
  RFC 7807). Spring Boot provides the `ProblemDetail` type and can auto-produce it via
  `ResponseEntityExceptionHandler` — enable with `spring.mvc.problemdetails.enabled=true`
  (verify the property against current docs — knowledge ~early 2026).
- Never leak stack traces, SQL, or internal messages to clients. The `detail` field is
  human-safe text; put correlation ids in a custom property, not the internals.

Centralize mapping: a try/catch in each controller means the same exception returns a different shape on different endpoints, and clients can't rely on the error contract.

```java
// bad: per-controller catch — inconsistent shape, leaks e.getMessage() (may contain SQL/PII)
@GetMapping("/orders/{id}")
ResponseEntity<?> get(@PathVariable String id) {
  try { return ResponseEntity.ok(service.find(id)); }
  catch (Exception e) { return ResponseEntity.status(500).body(e.getMessage()); }
}

// good: one advice, RFC 9457 ProblemDetail, safe detail text, status from the domain type
@ControllerAdvice
class ApiExceptionHandler {
  @ExceptionHandler(OrderNotFoundException.class)
  ProblemDetail handle(OrderNotFoundException e) {
    var pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Order not found");
    pd.setProperty("traceId", MDC.get("traceId"));
    return pd;
  }
}
```

Why it costs at scale: scattered handling makes the error contract un-documentable; one advice means a new exception type wires into the whole API by adding a single method.

## Logging

- Use SLF4J (`private static final Logger log = LoggerFactory.getLogger(Xxx.class);`), never
  `System.out` / `System.err`. SLF4J is a facade; the runtime backend (Logback by default in Spring
  Boot) decides format and destination.
- Levels: ERROR (action needed, paging-worthy), WARN (recoverable/odd), INFO (key business events),
  DEBUG (dev detail). Default production level is INFO.
- Log with parameters (`{}`), not string concatenation — the message isn't built unless the level is
  enabled, and the structured backend can index the args.
- NEVER log secrets, passwords, tokens, API keys, or full PII (card numbers, full email/phone).
- Prefer structured logs (key-value/JSON) and include a correlation/trace id (via MDC) so one
  request can be followed across services.

`System.out.println` bypasses levels, format, and the trace id — it can't be turned off in prod, has no timestamp/context, and may not even reach your log aggregator.

```java
// bad: no level, no timestamp, no traceId, can't be filtered, never aggregated
System.out.println("order created " + id);

// good: facade + level + parameterized message; MDC trace id is attached automatically
private static final Logger log = LoggerFactory.getLogger(OrderService.class);
log.info("Created order {}", id);   // arg only formatted if INFO is enabled
```

Parameterized over concatenation: at DEBUG-disabled-in-prod, concatenation still builds the (possibly expensive) string on every call; `{}` skips it. Across a hot path that's wasted CPU on logs nobody reads.

```java
// bad: string built every call even when DEBUG is off; no structure for the indexer
log.debug("payload=" + order.toString());

// good: lazy formatting, and the backend can index `orderId` as a field
log.debug("processing order orderId={}", order.id());
```

Logging a secret is a breach the moment it hits disk or a third-party log store — and it persists in backups long after you "fix" it. Redact at the source.

```java
// bad: token/password land in plaintext logs, shipped to your aggregator forever
log.info("auth attempt user={} password={} token={}", user, password, token);

// good: log the identity and outcome only; never the credential material
log.info("auth attempt user={} result={}", user, success ? "ok" : "denied");
```

Why it costs at scale: a single accidental secret in logs can force credential rotation, breach disclosure, and a backup purge across your whole retention window.

### Correlation / trace id

Put a per-request id into SLF4J's MDC (typically in a filter or via Micrometer Tracing) and include
it in the log pattern, so every line of a request — across threads and services — shares one id.

```java
// good: stamp a traceId at the entry filter; clear it in finally to avoid thread-pool leakage
MDC.put("traceId", traceId);
try { chain.doFilter(req, res); }
finally { MDC.clear(); }   // threads are reused — a stale MDC id mislabels the next request
```

Why it costs at scale: without a correlation id, debugging a distributed failure means manually
guessing which log lines belong together; forgetting `MDC.clear()` silently attributes one user's
logs to the next request on that pooled thread.

## Resilience (once you add external calls)

- Wrap calls to other services with timeouts and a retry/circuit breaker (Resilience4j) so one slow
  dependency can't hang the whole request.
- A call with no timeout inherits the platform default (often effectively infinite) — under a
  dependency stall that exhausts your thread pool and takes the whole service down with it.

# Errors & logging

## Exceptions

- Fail fast: validate at the boundary and throw early with a clear message.
- Use unchecked exceptions for unexpected/programming errors; define a small set of meaningful
  domain exceptions (e.g. `OrderNotFoundException`).
- Never swallow an exception (empty catch). Handle it meaningfully or let it propagate.
- Don't log-and-rethrow at every layer — log once, where it's handled.
- Catch specific exceptions, not `Exception`/`Throwable`, except at a top-level boundary.

## Validation

- Validate request DTOs with Bean Validation (`@NotNull`, `@Email`, …). Handle violations in one
  place and return an RFC 7807 error.

## API errors

- Translate exceptions to HTTP in a single `@ControllerAdvice` / `@ExceptionHandler`, not scattered
  try/catch in controllers. Never leak stack traces or internal messages to clients.

## Logging

- Use SLF4J (`LoggerFactory.getLogger(...)`), never `System.out`.
- Levels: ERROR (action needed), WARN (recoverable/odd), INFO (key business events), DEBUG (dev detail).
  Default production level is INFO.
- Log with parameters, not concatenation: `log.info("Created order {}", id)`.
- NEVER log secrets, passwords, tokens, or full PII.
- Prefer structured logs (key-value/JSON) and include a correlation/trace id so a request can be
  followed across services.

## Resilience (once you add external calls)

- Wrap calls to other services with timeouts and a retry/circuit breaker (Resilience4j) so one slow
  dependency can't hang the whole request.

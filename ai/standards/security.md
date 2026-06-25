# Security baseline

Scope: input validation, SQL injection, auth/authz (Spring Security), password hashing,
secrets, transport/dependencies, error/log leakage, OWASP Top 10. Baseline: Spring Boot 4.x,
Java 17+, `jakarta.*` (not `javax.*`). Error responses use RFC 9457 `ProblemDetail` (obsoletes 7807).

## Input

- Treat all input as hostile. Validate type, length, range, and format at the boundary.
- Prefer Bean Validation (`jakarta.validation`) on the request DTO with `@Valid` on the controller — declarative, fails closed, gives one consistent rejection path. Don't scatter ad-hoc `if` checks through the service.
- Prevent SQL injection: always use parameterized queries / JPA bind parameters, never string-built SQL.

String-concatenated SQL is the classic injection vector. The fix is a bound parameter, never escaping-by-hand.

```java
// bad: caller controls SQL; "x' OR '1'='1" dumps the table
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
em.createNativeQuery(sql).getResultList();

// good: value is bound, never parsed as SQL
em.createQuery("SELECT u FROM User u WHERE u.email = :email")
  .setParameter("email", email).getResultList();
```

Why it costs at scale: one concatenated query is a full data breach, not a bug ticket — and string SQL spreads by copy-paste, so the first one teaches the whole team the wrong pattern.

Note: JPQL/`@Query` binding protects the WHERE clause, not dynamic sort/column names. Never interpolate a user-supplied column or direction into ORDER BY — whitelist it against a fixed set.

## Auth

- Authenticate AND authorize on the server, on every protected endpoint — never trust the client. Use Spring Security.
- Check authorization at the resource level (can THIS user touch THIS object?), not just "is logged in". This is OWASP A01 (Broken Access Control) — the #1 category.
- Use OAuth2/OIDC or signed JWTs; keep tokens short-lived.
- Hash passwords with Argon2id (bcrypt acceptable). Never store plaintext; never use MD5/SHA for passwords.

"Logged in" is not "allowed". An ownership check that trusts the path/body id lets any authenticated user read anyone's data (IDOR).

```java
// bad: any authenticated user can read any order by guessing the id
@GetMapping("/orders/{id}")
Order get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

// good: scope the lookup to the caller's identity
@GetMapping("/orders/{id}")
Order get(@PathVariable Long id, @AuthenticationPrincipal UserDetails me) {
    return repo.findByIdAndOwner(id, me.getUsername()).orElseThrow();
}
```

Why it costs at scale: missing object-level checks don't fail loudly in tests (the happy path passes) — they surface as a breach when one user enumerates another's ids in production.

MD5/SHA are fast hashes built for throughput, which is exactly what an attacker wants for offline cracking. Use a deliberately slow, salted KDF.

```java
// bad: fast, unsalted, GPU-crackable at billions/sec; SHA-* is no better here
String hash = DigestUtils.md5Hex(rawPassword);

// good: salted, memory-hard, tunable cost; verify with encoder.matches(...)
PasswordEncoder encoder = new Argon2PasswordEncoder(16, 32, 1, 1 << 14, 3);
String hash = encoder.encode(rawPassword);
```

Why it costs at scale: when a fast-hashed table leaks, the whole user base is cracked in hours; a memory-hard KDF turns the same dump into a non-event. (Tune Argon2 params against current OWASP guidance — knowledge ~early 2026.)

## Secrets

- Never commit secrets, keys, or credentials. Use environment variables / a secrets manager (AWS Secrets Manager).
- Keep secrets out of logs, error messages, and source.

A secret in `application.yml` lives forever in git history and ships in every artifact and image layer. Inject it at runtime instead.

```yaml
# bad: real secret committed; now in git history + every built image
spring:
  datasource:
    password: S3cret-prod-Pw!
```

```yaml
# good: placeholder resolved from env / Secrets Manager at boot; nothing sensitive in the repo
spring:
  datasource:
    password: ${DB_PASSWORD}
```

Why it costs at scale: rotating a leaked-in-history secret means rewriting git history and re-issuing the credential everywhere it was copied — a hardcoded secret is never "just deleted".

## Dependencies & transport

- Keep dependencies updated and scan them for known vulnerabilities (OWASP Dependency-Check / Dependabot). This is OWASP A06 (Vulnerable & Outdated Components) — Spring's own CVEs (e.g. Spring4Shell) land here.
- Use HTTPS/TLS everywhere. Set sensible security headers and a strict CORS policy — no `*` in production.

`*` CORS plus credentials is an open door; pin the allowed origins.

```java
// bad: any site can call your API with the user's cookies attached
config.setAllowedOrigins(List.of("*"));
config.setAllowCredentials(true);

// good: explicit origin allowlist
config.setAllowedOrigins(List.of("https://app.example.com"));
config.setAllowCredentials(true);
```

Why it costs at scale: a permissive CORS policy is invisible until a malicious page drains authenticated sessions — and "loosen it for local dev" is how the wildcard reaches prod.

## Data & errors

- Apply least privilege (DB users, IAM roles). The app's DB user should not own DDL or hold admin grants.
- Don't leak internals: generic error to the client, full detail to logs only. Map exceptions with `@RestControllerAdvice` returning a sanitized `ProblemDetail` (RFC 9457).
- Know the OWASP Top 10 and check your code against it.

A raw exception bubbling out to the client leaks stack traces, SQL, and class names — reconnaissance handed to an attacker.

```java
// bad: default error surface exposes the exception message / trace to the caller
throw new RuntimeException("SQL error: duplicate key in users_email_uq on " + email);

// good: log the detail, return a sanitized RFC 9457 body, no internals
log.warn("duplicate signup for {}", email);
throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
```

Why it costs at scale: leaked internals turn one error into a map of your stack and schema — and once the verbose response is normalized, it leaks the same way on every endpoint.

# Security baseline

## Input

- Treat all input as hostile. Validate type, length, range, and format at the boundary.
- Prevent SQL injection: always use parameterized queries / JPA bind parameters, never string-built SQL.

## Auth

- Authenticate AND authorize on the server, on every protected endpoint — never trust the client. Use Spring Security.
- Check authorization at the resource level (can THIS user touch THIS object?), not just "is logged in".
- Use OAuth2/OIDC or signed JWTs; keep tokens short-lived.
- Hash passwords with Argon2id (bcrypt acceptable). Never store plaintext; never use MD5/SHA for passwords.

## Secrets

- Never commit secrets, keys, or credentials. Use environment variables / a secrets manager (AWS Secrets Manager).
- Keep secrets out of logs, error messages, and source.

## Dependencies & transport

- Keep dependencies updated and scan them for known vulnerabilities (OWASP Dependency-Check / Dependabot).
- Use HTTPS/TLS everywhere. Set sensible security headers and a strict CORS policy — no `*` in production.

## Data & errors

- Apply least privilege (DB users, IAM roles).
- Don't leak internals: generic error messages to clients, details to logs only.
- Know the OWASP Top 10 and check your code against it.

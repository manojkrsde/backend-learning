# API design — REST / HTTP

## Resources

- Name resources with plural nouns: `/orders`, `/orders/{id}/items`. No verbs in paths.
- Let HTTP methods be the verb: GET (read, safe), POST (create), PUT (full replace),
  PATCH (partial update), DELETE (remove).
- Use correct status codes: 200 OK, 201 Created (+ `Location` header), 204 No Content,
  400 bad input, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict,
  422 validation failed, 500 server error. Never return 200 with an error body.

## Contracts

- Expose DTOs, NEVER JPA entities. Leaking entities couples your DB schema to your public API.
- Version in the path: `/api/v1/...`. Don't break v1; add v2.
- Paginate every list endpoint (page+size or cursor). Never return an unbounded list.
- Make writes idempotent where it matters (PUT, and POST with an idempotency key) so retries are safe.

## Errors

- Return errors in ONE consistent shape — RFC 7807 (`application/problem+json`) with
  type, title, status, detail. Same shape for every error in the API.

## Docs & consistency

- Generate OpenAPI from the code (springdoc) and keep it accurate.
- Be consistent across all endpoints: camelCase JSON, ISO-8601 UTC timestamps, same naming style.
  Consistency beats cleverness.

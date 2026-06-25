# API design — REST / HTTP

The wire contract: URLs, methods, status, the JSON shape clients depend on. Once a client
ships against it, you own it forever — so get the contract right before the implementation.

## Resources

- Name resources with plural nouns: `/orders`, `/orders/{id}/items`. No verbs in paths —
  the method is the verb.
- Let HTTP methods carry intent: GET (read, safe, cacheable), POST (create), PUT (full
  replace), PATCH (partial update), DELETE (remove).

```java
// bad — verb in path, intent hidden, can't cache, GET that mutates
@PostMapping("/api/v1/getUserOrders")        // also: GET smuggled as POST
// good — noun + method express everything
@GetMapping("/api/v1/users/{id}/orders")
```

Why it costs at scale: verb-in-path URLs multiply (`/getUser`, `/fetchUser`, `/loadUser`)
because nothing constrains the vocabulary, and proxies/CDNs can't cache a POST that only reads.

- Use correct status codes: 200 OK, 201 Created (+ `Location` header), 204 No Content,
  400 malformed, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict,
  422 validation failed, 500 server error.
- Never return 200 with an error body. The status code IS the outcome — clients and proxies
  branch on it before they ever parse the body.

```java
// bad — 200 + {"success":false}; every client must parse the body to know it failed
return ResponseEntity.ok(Map.of("success", false, "error", "not found"));
// good — status is the signal; monitoring, retries, and caches all read it correctly
return ResponseEntity.notFound().build();   // 404, empty body
```

Why it costs at scale: "200-with-error" hides failures from every dashboard, alert, and
retry policy that keys on status — your error rate reads 0% while users are failing.

## Contracts

- Expose DTOs, NEVER JPA entities. The entity is your storage shape; the DTO is your published
  contract. They must be free to change independently.

```java
// bad — return the entity: lazy-loads explode to N+1 on serialize, leaks columns,
//       and a DB rename silently breaks every client
@GetMapping("/{id}") Order get(@PathVariable Long id){ return repo.findById(id).get(); }
// good — map to a DTO you control; only published fields cross the wire
@GetMapping("/{id}") OrderResponse get(@PathVariable Long id){
  return OrderResponse.from(service.find(id));   // a Java record is ideal here
}
```

Why it costs at scale: a leaked entity welds your DB schema to your public API — you can't
rename a column, add a relation, or drop a field without a coordinated client migration.

- Coming from Node/TS: there is no structural typing here. The DTO is an explicit class/record;
  serialization is Jackson reflecting over getters/fields, not `JSON.stringify`. A field you
  forget to expose simply never appears — and a lazy JPA relation you DO expose throws at
  serialize time (`LazyInitializationException`) outside the transaction. Map deliberately.

- Validate inbound DTOs with Bean Validation annotations (`@NotNull`, `@Email`, `@Size`).
  Mechanics of handling violations live in `errors-and-logging.md`.

### Versioning

- Spring Boot 4 has BUILT-IN API versioning (verify against current docs — knowledge ~early
  2026): declare a version on the mapping and configure how it's resolved (path segment,
  header, or media type) centrally, instead of hand-rolling `/v1` string prefixes everywhere.

```java
// good — framework-resolved version; resolution strategy configured once, not per-path
@GetMapping(path = "/users/{id}", version = "1")
UserResponse getV1(@PathVariable Long id){ ... }
```

- Never break a shipped version. Adding a field is non-breaking; removing/renaming a field or
  tightening validation is breaking — ship that as a new version and keep the old one alive
  until clients migrate. You do not control when callers upgrade.

### Pagination

- Paginate EVERY list endpoint — no exceptions for "small" tables. And always send an explicit,
  stable sort: pagination without a deterministic `ORDER BY` returns rows in undefined order, so
  page 2 can repeat or skip rows from page 1.

```java
// bad — unbounded; one big tenant OOMs the JVM and the DB scans the whole table
@GetMapping List<Order> all(){ return repo.findAll(); }
// good — bounded page + explicit stable sort; cap the size server-side
@GetMapping Page<OrderResponse> list(
    @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable p){
  return service.page(p).map(OrderResponse::from);   // also clamp size to a max (e.g. 100)
}
```

Why it costs at scale: an unbounded list works in dev with 10 rows and takes the service down
the day a customer has 2 million — it's a latent outage, not a missing feature.

- For deep or live-updating lists prefer cursor (keyset) pagination over offset: `OFFSET 100000`
  forces the DB to scan and discard 100k rows, and offsets shift when rows are inserted.

### Idempotency

- GET/PUT/DELETE are idempotent by definition — repeating them lands in the same state, so a
  client can safely retry on a timeout. POST is not; a dropped response means the client doesn't
  know if the order was created and a blind retry double-charges.
- Make unsafe creates idempotent with a client-supplied `Idempotency-Key` header: store the key
  with its first result, and on a repeat key return the original response instead of acting again.

```java
// good — same key ⇒ same outcome, exactly-once effect under retries
@PostMapping("/payments")
ResponseEntity<PaymentResponse> pay(@RequestHeader("Idempotency-Key") String key,
                                    @Valid @RequestBody PaymentRequest req){
  return service.processOnce(key, req);   // first call charges; replays return the stored result
}
```

Why it costs at scale: without idempotency keys, every network blip on a POST becomes a
duplicate side effect — double charges, double emails — and the failures are intermittent and
unreproducible.

## Errors

- ONE error shape for the entire API: RFC 9457 `application/problem+json` (RFC 9457 obsoletes
  7807 — the JSON shape is unchanged, the spec number changed; use ProblemDetail and say 9457).
  Spring's `ProblemDetail` builds it for you, with fields `type`, `title`, `status`, `detail`,
  `instance`. Add domain fields under `properties`.

```java
// bad — bespoke error JSON; every endpoint invents its own keys, clients special-case each
return ResponseEntity.status(404).body(Map.of("err","no order","code",42));
// good — standard ProblemDetail; one parser handles every error in the API
var pd = ProblemDetail.forStatusAndDetail(NOT_FOUND, "Order " + id + " not found");
pd.setType(URI.create("https://errors.example.com/order-not-found"));
pd.setProperty("orderId", id);
return ResponseEntity.of(pd).build();   // sets application/problem+json
```

Why it costs at scale: N ad-hoc error shapes force every client into N parsing branches and N
error-handling code paths; one standard shape means clients (and your own SDKs) handle errors
once. Build these in a single `@ControllerAdvice` (see `errors-and-logging.md`), not per-controller.

## Docs & consistency

- Generate OpenAPI from the code with springdoc (`springdoc-openapi-starter-webmvc-ui`, the
  Spring Boot 3+/jakarta line — verify against current docs, knowledge ~early 2026). The spec is
  derived from your annotations, so it can't drift from the running code the way a hand-written
  doc does.
- Be consistent across all endpoints: camelCase JSON keys, ISO-8601 UTC timestamps
  (`2026-06-25T14:30:00Z`), the same plural-noun and pagination conventions everywhere.
  Consistency is a feature — a predictable API needs no per-endpoint documentation reading.

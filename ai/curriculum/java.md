# Java — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** everything (foundational). **Target:** Java 21+, ideally 25 (LTS).

**Why this matters:** Java is the language and runtime everything else in this stack sits on. You already know how to program — the win here isn't syntax, it's the idioms interviewers probe and the runtime behavior that bites in production: the static type system, the collection contracts, and a real threading model instead of an event loop.

Move fast on syntax and OOP; spend the depth on the items below and on the Node→Java delta.

## Depth tiers

### Core — learn deeply
- OOP in Java: classes, interfaces, abstract classes, encapsulation, composition over inheritance.
- Collections: List/Set/Map/Queue, when to use each, and the `equals`/`hashCode` contract.
- Generics, including bounded types and wildcards (`? extends` / `? super`).
- `Optional` — as a return type for "maybe absent", never for fields or parameters.
- Exceptions: checked vs unchecked, try-with-resources, when to define a custom exception.
- Streams API and lambdas: map/filter/reduce/collect, method references, functional interfaces.
- Concurrency: threads, executors, the basics of the memory model, AND virtual threads (Project Loom).
  Learn the virtual-threads-vs-reactive tradeoff — Loom removes most reasons to reach for reactive.
- Modern Java: records, sealed classes, switch pattern matching, text blocks, `var`.
- A build tool: Maven (most common) or Gradle — dependencies, lifecycle, plugins.
- Dependency injection as a concept (Spring does it for you, but know what it is).

### Working knowledge
- File/IO and the `java.time` date/time API.
- Regex; SLF4J + Logback (cross-ref `standards/errors-and-logging.md`).
- Modules (JPMS) — know they exist and why a JAR might be modular.

### Awareness only
- Deep Java Memory Model, `volatile` / `happens-before` semantics, low-level cryptography APIs.

### Skip — and why
- Play, Quarkus, Javalin — Spring Boot is the target. EBean — use JPA. TestNG — JUnit 5 is standard. Bazel — Maven/Gradle covers you.

## Node → Java delta

The concepts are the same; these are the things that are genuinely different and where bugs hide.

- **Static, compiled, nominal typing.** Types are checked at compile time and enforced at runtime — unlike TypeScript, whose types are erased. The compiler is your first test suite.
- **`equals`/`hashCode` is a contract you implement.** There's no "object as a map" — a `HashMap` key with a wrong/missing `hashCode` silently fails to find entries. `record`s generate both correctly for free.
- **Checked exceptions exist.** A category with no JS/TS equivalent — the signature forces you to handle or declare them.
- **Real threads + shared memory, not an event loop.** Concurrency is preemptive and shared-state. Virtual threads let you write straight-line blocking code that still scales to millions of tasks — the *opposite* mental model from `async/await`.
- **Streams are lazy pipelines.** Nothing runs until a terminal operation; `Array.map/filter` in JS are eager. This changes both performance and debugging.
- **No null-safety in the type system.** Unlike TS `strictNullChecks`, references are nullable by default; `Optional` is a return-type tool, not a field type.

## Learning objectives

After this you can:
- Pick the right collection for a use case and implement a correct `equals`/`hashCode` pair.
- Explain when a checked vs unchecked exception is the right choice.
- Write a Stream pipeline and point to exactly where it's lazy and where it terminates.
- Explain the virtual-threads-vs-reactive tradeoff and when each fits.
- Model a small domain with `record`s + `sealed` types and exhaustively `switch` over it.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Model a small domain (e.g. order states) with `record`s + a `sealed` interface; exhaustively `switch` on it.
- Implement a value object with correct `equals`/`hashCode` and use it as a `Map` key.
- Refactor an imperative loop into a Stream pipeline; explain where laziness kicks in.
- Run a batch of I/O calls on a virtual-thread executor; compare throughput to a fixed thread pool.
- Define a custom unchecked exception and clean up a resource with try-with-resources.

## Common pitfalls

- Using `Optional` for fields or parameters (it is a return type only).
- Sharing a non-thread-safe collection (`ArrayList`, `HashMap`) across threads.
- Breaking the `equals`/`hashCode` contract → silent `Map`/`Set` misses.
- Catching `Exception` broadly and swallowing it — you lose the stack trace and hide bugs.
- Learning from Java 8 tutorials and missing records, switch patterns, and virtual threads.

## Canonical resource

- Dev.java — the official learning portal: https://dev.java/learn/

## Modern (2026)

- Java 25 is the current LTS (Sept 2025); Java 21 is the prior LTS (virtual threads are GA since 21). Java 26 exists but is non-LTS — stay on an LTS unless you have a reason. Don't learn against Java 8.

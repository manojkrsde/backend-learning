# Java — curriculum

**Phase:** 1 · **Priority:** core · **Pulls in:** everything (foundational). **Target:** Java 21+, ideally 25 (LTS).

The language and runtime. You know how to program, so move fast on syntax and OOP and spend the depth
on what's different or what interviewers probe.

## Core — learn deeply

- OOP in Java: classes, interfaces, abstract classes, encapsulation, composition over inheritance.
- Collections: List/Set/Map/Queue, when to use each, the equals/hashCode contract.
- Generics, including bounded types and wildcards.
- Optional — as a return type for "maybe absent", never for fields/params.
- Exceptions: checked vs unchecked, try-with-resources, when to define a custom exception.
- Streams API and lambdas: map/filter/reduce/collect, method references, functional interfaces.
- Concurrency: threads, executors, the basics of the memory model, AND virtual threads (Project Loom).
  Learn the virtual-threads-vs-reactive tradeoff — Loom removes most reasons to reach for reactive.
- Modern Java: records, sealed classes, switch pattern matching, text blocks, `var`.
- A build tool: Maven (most common) or Gradle — dependencies, lifecycle, plugins.
- Dependency injection as a concept (Spring does it for you, but know what it is).

## Working knowledge

- File/IO and the `java.time` date/time API.
- Regex; SLF4J + Logback (cross-ref `standards/errors-and-logging.md`).
- Modules (JPMS) — know they exist.

## Awareness only

- Deep Java Memory Model, `volatile` semantics, low-level cryptography APIs.

## Skip — and why

- Play, Quarkus, Javalin (Spring Boot is the target), EBean (use JPA), TestNG (JUnit 5 is standard), Bazel.

## Modern (2026)

- Use Java 21+ (virtual threads are GA in 21); 25 is the newest LTS. Don't learn against Java 8 tutorials.

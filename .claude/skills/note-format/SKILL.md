---
name: note-format
description: The required format for writing a learning note into ai/memory/learned-concepts.md. Use whenever recording a concept the user has learned (the scribe persona uses this). Keeps notes short, consistent, and optimized for fast recall and the weekly exam.
---

# Note format

How to write a concept note into `ai/memory/learned-concepts.md`. The goal is a note the user
can re-read in 30 seconds before an exam and immediately recall the mechanism — not an essay.

## When to use

- The scribe uses this after a task passes review, to record each concept learned.
- Any tool (Claude Code, Codex, Gemini, Cursor, plain chat) reads THIS file to get the format,
  then writes the note into `learned-concepts.md`.

## Where it goes

- Add a new `##` section to `learned-concepts.md`.
- If a section for the concept already exists, EDIT it in place — never duplicate. Re-exercises
  and exams deepen the same note; they don't spawn new ones.
- After writing, add one line under "Concept notes" in `ai/memory/INDEX.md`, keyed by the slug,
  so it's findable.

## The template

````
## <Concept name>
- **Key:** <slug used in state.json, e.g. spring-transactional> · **Area:** <java|spring|postgres|api|testing|...> · **Learned:** <date>
- **In one line:** <what it is and when you reach for it>
- **How it works:** <the mechanism — why/how it works underneath, 2–4 sentences>
- **Java/Spring way:** <how this stack does it, and the delta from the Node/TS way you already knew>
- **Gotcha:** <the easy mistake, or the thing that bit you>
- **Proof:** <ONE doc link, or the file in project/ where you used it>
````

## Rules

- Plain English, short. **How it works** and **Gotcha** are the most important fields — the
  examiner tests those, so never leave them thin.
- The user already knows the backend CONCEPT from Node. Write the DELTA: what's different in
  Java/Spring, not a recap of the concept.
- ONE source in Proof, not a list. Prefer pointing at the real file in `project/` over pasting code.
- `Key` must match the slug in `state.json`, so the note, its mastery score, and the INDEX line
  all line up.
- One concept per note. If two ideas are tangled, write two notes.

## Example

````
## @Transactional (Spring)
- **Key:** spring-transactional · **Area:** spring · **Learned:** 2026-06-25
- **In one line:** Wraps a service method in one DB transaction that commits on success and rolls back on a runtime exception.
- **How it works:** Spring wraps the bean in a proxy; calling the method opens a transaction bound to the current thread, and the proxy commits when it returns or rolls back when it throws. Because it's a proxy, it only fires on calls that enter the bean from outside.
- **Java/Spring way:** Declarative — you annotate the method instead of opening/closing a transaction by hand like the ORM made you in Node. Put it on the SERVICE layer; mark read paths readOnly = true.
- **Gotcha:** One method calling another @Transactional method on the SAME class bypasses the proxy, so the annotation silently does nothing (self-invocation). By default it also only rolls back on unchecked exceptions, not checked ones.
- **Proof:** project/order/OrderService.java
````

## Avoid

- Re-explaining the concept ("a transaction groups writes so they all commit or all roll back") —
  the user knows. Capture the Java/Spring delta and the gotcha instead.
- A vague Gotcha like "be careful with this." Name the specific trap.
- More than one link, or a wall of pasted code in Proof.

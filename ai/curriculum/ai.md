# AI integration — curriculum

**Phase:** 1 · **Priority:** supporting (add LAST) · **Pulls in:** an LLM / RAG feature, pgvector, SSE streaming. **Target:** Spring AI on Spring Boot 4.x.

**Why this matters:** Every backend now grows an LLM feature — semantic search, a support assistant, a summarizer. You are not training models; you are integrating them, and that's an ordinary backend integration problem (an HTTP client, a vector index, a retrieval query) with a few new failure modes. Add this only after the core backend is solid.

You already know LLMs, prompts, RAG, agents, and MCP from Node. Move fast on all of that. Spend the depth on the Spring AI abstractions, on doing RAG against pgvector inside the JPA/Postgres stack you already have, and on the production concerns interviewers probe: token/cost control, streaming, and prompt-injection defense.

## Depth tiers

### Core — learn deeply (the backend slice)
- **`ChatClient`** — the fluent entry point: system + user messages, prompt templates, parameters (temperature, max tokens), structured output mapping a response straight to a Java record/POJO.
- **Embeddings + a vector store**: `EmbeddingModel` → store in **pgvector** (`sql-postgres.md`) via Spring AI's `VectorStore`. Chunk, embed, upsert, similarity-search with a metadata filter.
- **RAG end to end**: chunk → embed → store → retrieve (similarity search) → stuff context into the prompt → generate. Spring AI gives you `Advisor`s (e.g. a question-answer/RAG advisor) so you don't hand-roll the retrieve-then-prompt loop.
- **Tool / function calling**: annotate a Java method as a tool; the model decides to call it and Spring AI marshals the JSON args and the result.
- **Streaming over SSE** (`api-design.md`): stream tokens as they generate instead of blocking on the full completion.
- **Token & cost control**; **prompt-injection defense** and basic output safety.

### Working knowledge
- `PromptTemplate` and prompt versioning; the `Document`/`DocumentReader`/`TextSplitter` ingestion pipeline; chat memory / conversation history; observability of AI calls via Micrometer (`observability.md`).

### Awareness only
- **Agents and MCP** — you already use these from Node; Spring AI supports both, but they're off the critical path for a first backend AI feature.
- Image/audio model APIs in Spring AI — know they exist; out of scope for the backend slice.

### Skip — and why
- Model training, fine-tuning, and multimodal generation — not a backend-integration job.
- The deep LangChain/LlamaIndex ecosystem — Spring AI covers the JVM side; don't bolt on a second framework.

## Node → Java delta

- **`ChatClient`, not raw HTTP.** Spring AI abstracts the provider behind one client and one set of beans — swap models via config, not code. You don't hand-build request JSON the way you might with a Node SDK.
- **Structured output is type-driven.** Ask for a `record` back and Spring AI maps the model's JSON onto it (with schema hints) — no manual `JSON.parse` + Zod validation step.
- **The vector store lives in the DB you already run.** pgvector is a Postgres extension, so retrieval is a SQL query through the same datasource and Testcontainers setup (`sql-postgres.md`) — not a separate service.
- **Tools are typed Java methods.** A `@Tool`-annotated method's parameter types *are* the schema; the model can't pass a shape the method won't accept.
- **Streaming is a `Flux<String>` over SSE**, surfaced through the web layer — the reactive return type here is normal even on an otherwise blocking MVC app.

## Learning objectives

After this you can:
- Call an LLM through `ChatClient` and map the reply onto a Java record via structured output.
- Embed text, store it in pgvector with metadata, and run a filtered similarity search.
- Build a RAG endpoint end to end and explain exactly where retrieval is injected into the prompt.
- Expose a Java method as a tool and trace one tool-call round-trip.
- Stream a completion to the client over SSE and cap token spend per request.
- Name two prompt-injection vectors and the defense for each.

## Task ladder

Example features that exercise this topic — pull one when the project needs it, not as a checklist.

- Add a `/summarize` endpoint that calls an LLM via `ChatClient` and returns a typed record (structured output).
- Build semantic search over your domain data: ingest → embed → store in pgvector → similarity-search endpoint.
- Turn that into RAG: retrieve top-k chunks, inject them as context, answer with citations.
- Register a domain method (e.g. "look up order status") as a tool and let the model call it.
- Stream a long answer to the browser over SSE; add a per-request token budget and log token usage/cost.
- Add an input guard that strips/flags prompt-injection attempts before the call.

## Common pitfalls

- **Trusting model output as control flow** — treat tool args and generated text as untrusted user input; validate before acting.
- **Prompt injection via retrieved/RAG content** — retrieved documents can carry instructions; isolate untrusted context and never give the model raw authority over side effects.
- **No token budget** — unbounded context or runaway tool loops blow up latency and cost; cap tokens and tool-call rounds.
- **Storing raw embeddings without a vector index** — sequential scans don't scale; add the pgvector index and tune it (`sql-postgres.md`).
- **Pinning to a model name that gets retired** — model ids and params churn; keep them in config and verify against current docs.

## Canonical resource

- Spring AI reference documentation: https://docs.spring.io/spring-ai/reference/

## Modern (2026)

- **Spring AI is GA and production-ready** (1.0 GA May 2025; 1.x and 2.x released) — drop any "is it mature yet" hesitation. It's the first-party JVM option and integrates cleanly with Boot 4.x, pgvector, and Micrometer.
- The AI field itself still moves fast: **verify model names, parameters, and pricing against current provider docs** (knowledge ~early 2026) — but the Spring AI *abstractions* (`ChatClient`, `VectorStore`, advisors, tools) are stable to build on.

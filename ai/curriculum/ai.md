# AI integration — curriculum

**Phase:** 1 · **Priority:** supporting (add LAST) · **Pulls in:** an LLM / RAG feature.
**Caveat:** this field moves weekly and these notes are early-2026 — verify everything against current docs.

Scope it to the BACKEND-developer slice. You are not training models; you are integrating them. You're
already ahead here (you use Claude, have an `ai` schema, and an MCP connector).

## Core — learn deeply (the backend slice)

- Call an LLM API: messages, system prompts, parameters, handling the response.
- Embeddings + a vector store: pgvector (sql-postgres.md) — chunk, embed, store.
- RAG end to end: chunk → embed → store → retrieve (similarity search) → generate.
- Function / tool calling; streaming responses over SSE (api-design.md).
- Token & cost control; prompt-injection defense and basic output safety.

## Wire it in

- Spring AI is the emerging first-party option — verify its maturity given how fast it moves.

## Awareness only

- Agents and MCP — you're already ahead of the generic roadmap here.

## Skip (off-path for a backend dev, or too volatile)

- Model training, fine-tuning, multimodal (DALL-E/Whisper), the deep LangChain/LlamaIndex ecosystem.

## Sequence

- Add ONE AI feature only after the core backend is solid — e.g., semantic search over your domain data.

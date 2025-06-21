# 15: Prompt Storage Engine

This document defines the full structure, configuration, and operational details for the Prompt Storage Engine component of kAI/kOS. This engine stores every inbound prompt, outbound response, revision, summary, and related metadata for retrieval, auditing, learning, and visualization purposes.

---

## I. Purpose

The Prompt Storage Engine ensures:
- Accurate historical logs of every prompt/completion interaction
- Efficient retrieval for memory, fine-tuning, and debugging
- Metadata indexing for filtering by user, agent, service, timestamp, tags, etc.
- Real-time synchronization with vector storage for semantic search

---

## II. Directory Structure

```text
src/
└── storage/
    ├── prompts/
    │   ├── PromptStore.ts              # Core logic for writing/reading prompt objects
    │   ├── PromptIndex.ts              # Query layer for searching/filtering prompts
    │   ├── PromptValidator.ts          # Ensures schema compliance
    │   ├── PromptWriter.ts             # Batched async writer with retry & fallback
    │   └── prompt_models.ts            # Pydantic models for prompt schema
    └── configs/
        └── prompt_storage.yaml         # YAML config for backend selection, TTL, etc.
```

---

## III. Prompt Schema

```ts
interface StoredPrompt {
  id: string;                        // UUID or ULID
  userId: string;                   // Reference to user profile
  agentId: string;                  // Agent that handled the prompt
  serviceId: string;                // e.g., openai, ollama
  originalPrompt: string;
  completion: string;
  timestamp: ISODateString;
  tags?: string[];                  // Optional user-assigned labels
  language?: string;                // Detected or user-defined
  personaUsed?: string;
  vectorEmbedding?: number[];       // Optional vector (for sync with vector DB)
  metadata?: Record<string, any>;   // Custom fields
}
```

---

## IV. Storage Backends

### A. Default: PostgreSQL
- Uses `SQLAlchemy` or `TortoiseORM` for async schema
- Tables: `stored_prompts`, `prompt_metadata`, `prompt_tags`
- Indexed fields: `userId`, `agentId`, `tags`, `timestamp`

### B. Alternative: MongoDB
- If flexibility > consistency
- Use `motor` or `mongoengine`

### C. Local JSONStore (fallback mode)
- Per-user files under `~/.kai/prompts/`
- Schema-compatible; used only when offline or debugging

### D. Vector Sync
- Stores vector in primary DB or syncs to:
  - Qdrant
  - Chroma
  - Weaviate

---

## V. Prompt Index & Search

```ts
await promptIndex.search({
  userId: 'user-abc',
  tag: 'research',
  after: '2025-06-01T00:00:00Z',
  keywords: ['quantum', 'LLM'],
  embedding: [...],  // optional: vector-based hybrid search
  topK: 10
})
```

---

## VI. Prompt Storage Config

```yaml
# prompt_storage.yaml
backend: postgresql
retention_days: 365
batch_write: true
max_batch_size: 10
write_retry_delay_ms: 500
embedding_provider: local
embedding_sync: true
fallback_if_fail: json
```

---

## VII. Logging & Audit
- Each write op logs UUID, size, result, timestamp
- Optional full diff logging for revision detection
- `audit_prompts.log` file maintained daily with redacted values if needed

---

## VIII. Integration Hooks

- `kMemory` pulls historical prompt/completion pairs
- `PromptTransformer` fetches last N for context
- `UserDashboard` visualizes logs + allows tagging/annotation
- `TrainingExporter` uses this data for fine-tuning tasks

---

## IX. Future Additions

| Feature                   | Version  |
|--------------------------|----------|
| Prompt Deduplication     | v1.1     |
| Revise Chain Linkage     | v1.2     |
| Webhook on New Prompt    | v1.3     |
| Prompt Visualization UI  | v2.0     |

---

### Changelog
- 2025-06-20: Initial full blueprint for Prompt Storage Engine added to kAI/kOS.


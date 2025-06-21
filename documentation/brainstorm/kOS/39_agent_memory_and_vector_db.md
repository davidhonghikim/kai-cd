# 39: Agent Memory and Vector Database Integration (kAI)

This document outlines the architecture, configurations, and low-level implementation details for enabling persistent, queryable memory for kAI agents via vector database integration. This system allows agents to store, retrieve, and reason over long-term context and semantic information.

---

## I. Purpose

Enable agents to:

- Store contextual memories
- Perform semantic search over prior knowledge
- Dynamically retrieve relevant facts during conversations
- Index documents, events, and interactions

---

## II. Directory Structure

```text
src/
└── memory/
    ├── index.ts                      # Unified memory interface
    ├── providers/
    │   ├── chroma.ts                 # Chroma client adapter
    │   ├── qdrant.ts                 # Qdrant client adapter
    │   ├── weaviate.ts               # Weaviate adapter
    │   └── pinecone.ts              # Pinecone integration
    ├── utils/
    │   ├── embed.ts                 # Embedding generation wrapper
    │   └── schema.ts                # Memory object schema + validation
    ├── agents/
    │   ├── MemoryAgent.ts           # Base class for agents with memory
    │   └── MemoryIndexer.ts         # Background index worker
    └── config/
        └── memory.config.ts         # Storage selection + provider configs
```

---

## III. Supported Vector Stores

| Provider | Local | Cloud | Auth Method      |
| -------- | ----- | ----- | ---------------- |
| Chroma   | ✅     | ✅     | None / API Token |
| Qdrant   | ✅     | ✅     | API Key          |
| Weaviate | ✅     | ✅     | API Key / Bearer |
| Pinecone | ❌     | ✅     | API Key          |

---

## IV. Memory Object Schema

```ts
interface MemoryObject {
  id: string;                      // Unique memory ID
  agentId: string;                // Originating agent
  namespace: string;              // Memory category (e.g., "calendar")
  content: string;                // Raw text or summary
  embedding: number[];           // Precomputed vector
  metadata: Record<string, any>; // Optional tags (date, source, etc.)
  timestamp: string;             // ISO8601
}
```

---

## V. Memory Flow

### A. Indexing

1. Agent generates a `MemoryObject`
2. Embedding is generated using `/utils/embed.ts`
3. `MemoryIndexer.ts` pushes to configured vector DB

### B. Retrieval

1. Query text is embedded
2. Nearest neighbors retrieved from vector DB
3. Ranked results returned to agent logic

---

## VI. Embedding Provider Support

### Local

- **Ollama (embedding models)**: Uses local API like `http://localhost:11434/api/embeddings`

### Remote

- **OpenAI**: `text-embedding-3-small`
- **Cohere**: `embed-english-v3`
- **Hugging Face Inference**

### Configurable via:

```ts
const memoryConfig = {
  embedder: 'openai',
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY
};
```

---

## VII. Memory Types by Namespace

| Namespace      | Description                            |
| -------------- | -------------------------------------- |
| `conversation` | Chat transcripts, Q&A, dialogue events |
| `documents`    | Indexed documents / PDFs / text files  |
| `tasks`        | Past tasks, plans, failures            |
| `calendar`     | Meetings, reminders, logs              |
| `commands`     | Executed commands, API calls           |
| `agents`       | Other agents’ capabilities & history   |

---

## VIII. Agent Usage Example

```ts
const agentMemory = new MemoryAgent('assistant', memoryConfig);
await agentMemory.store({
  namespace: 'conversation',
  content: 'User asked about hydroponic setups.'
});

const matches = await agentMemory.query({
  namespace: 'conversation',
  query: 'hydroponics'
});
```

---

## IX. Background Indexer (MemoryIndexer.ts)

- Runs async background job
- Batch processes memory items
- Handles retries and backoff
- Logs status to `kLog`

---

## X. Future Features

| Feature                          | Status        |
| -------------------------------- | ------------- |
| Chunked PDF/document ingestion   | 🟨 Planned    |
| Memory expiration / aging        | 🟨 Planned    |
| Memory compression/summarization | ⬜ Not Started |
| Auto-tagging via LLM             | ⬜ Not Started |
| Per-agent memory access control  | ⬜ Not Started |

---

## XI. Security Notes

- All memory objects encrypted at rest if local storage is used
- Remote vector stores must use HTTPS and API keys
- Memory queries and logs are audit-tracked under agent ID namespace

---

## XII. Developer Tasks

-


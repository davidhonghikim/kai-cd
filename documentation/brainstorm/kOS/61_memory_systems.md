# 61: Memory Systems – Active, Passive & Shared Knowledge Layers

This document describes the memory architecture of the kAI agent stack within kOS, including the types of memory agents can use, how memory is stored and queried, and how shared knowledge is synchronized across distributed agents.

---

## I. Memory Architecture Overview

```text
src/
└── memory/
    ├── core/
    │   ├── memory_router.ts            # Orchestrates memory layer selection
    │   ├── memory_types.ts             # Definitions for memory interfaces
    │   ├── memory_utils.ts             # Utilities: hashing, filtering, etc.
    │   └── memory_adapter.ts           # Adapter pattern for active/passive
    ├── active/
    │   ├── long_term_memory.ts         # VectorDB interface (Qdrant, Chroma)
    │   └── episodic_memory.ts          # JSON/SQL-based event logs
    ├── passive/
    │   ├── local_cache.ts              # Redis/Memcached temporary memory
    │   └── session_memory.ts           # In-memory or SQLite scoped context
    ├── shared/
    │   ├── federation_link.ts          # Protocol bridge for memory sync
    │   └── group_memory_index.ts       # Shared summary embeddings
    └── cli/
        └── memory_debug.ts             # Query tool for testing memory reads
```

---

## II. Memory Types & Roles

### A. Passive Memory

- **Scope:** Ephemeral and low-latency
- **Use Cases:** Dialog context, short-term session data
- **Backends:**
  - `Redis`
  - `In-Memory Cache`
  - `SQLite (lightweight fallback)`

### B. Active Memory

- **Scope:** Long-term semantic memory
- **Use Cases:**
  - Vector similarity search
  - Agent self-reflection
  - Cross-session recall
- **Backends:**
  - `Qdrant`
  - `Chroma`
  - `Weaviate`
  - `Pinecone` (optional cloud)

### C. Shared Memory (Federated)

- **Scope:** Collaborative agent recall
- **Use Cases:**
  - Shared task progress
  - Distributed goals
  - Knowledge synchronization
- **Mechanism:**
  - `KLP` (Kind Link Protocol) sync layer
  - Gossip + signed memory packets

---

## III. Memory Storage Schema

### A. Memory Record Format (Vector Index)

```ts
interface MemoryRecord {
  id: string;
  type: 'observation' | 'thought' | 'instruction';
  embedding: number[];
  metadata: {
    agentId: string;
    timestamp: string;
    tags: string[];
    importance: number;
    source: 'user' | 'agent' | 'external';
  };
  content: string;
}
```

### B. Session Memory (SQLite)

```ts
interface SessionRecord {
  sessionId: string;
  messages: Array<{ role: string, content: string, timestamp: string }>;
  createdAt: string;
  lastAccessed: string;
}
```

---

## IV. Memory Access API (Abstracted)

### A. Memory Adapter API

```ts
interface MemoryAdapter {
  store(record: MemoryRecord): Promise<void>;
  search(query: string, topK: number): Promise<MemoryRecord[]>;
  delete(id: string): Promise<void>;
  summarize(tags?: string[]): Promise<string>;
}
```

### B. Memory Router Logic

- Route based on:
  - `importance`
  - `recall likelihood`
  - `agent configuration`

---

## V. Memory Sync & Federation

### A. Shared Memory Packets

```ts
interface MemorySyncPacket {
  from: DID;
  timestamp: string;
  payload: MemoryRecord[];
  signature: string;
}
```

### B. Trust & Merge Policy

- Validate `DID` signature
- Apply `trust graph` weight
- Merge based on vector similarity threshold and recency

---

## VI. Config Files

### A. memory.config.json

```json
{
  "active": "qdrant",
  "passive": "redis",
  "shared": true,
  "router": {
    "importanceThreshold": 0.65,
    "cacheTTL": 300
  },
  "federation": {
    "enabled": true,
    "syncInterval": 15,
    "trustGraphPath": "./klp/TrustLinkGraph.json"
  }
}
```

---

## VII. Future Enhancements

| Feature                           | Target Version |
| --------------------------------- | -------------- |
| Memory aging + decay heuristics   | v1.2           |
| Multimodal embedding support      | v1.3           |
| Secure enclave memory persistence | v1.5           |
| CRDT-based sync model             | v1.6           |
| Persona-specific memory scopes    | v2.0           |

---


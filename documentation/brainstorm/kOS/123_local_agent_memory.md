# 123: Local Agent Memory Architecture

This document specifies the local memory architecture for agents in the `kAI` and `kOS` ecosystem, including memory types, storage backends, retrieval logic, and recall strategies. This is the definitive specification for designing, implementing, and extending agent-level memory capabilities.

---

## I. Memory Types

### A. Short-Term Memory (STM)

- **Purpose:** Maintain immediate conversation context
- **Scope:** Last N interactions (\~20 messages or 15 minutes)
- **Storage:** In-memory (RAM) with optional IndexedDB/browser memory fallback (in `kAI`)
- **Eviction:** LRU (Least Recently Used)
- **Serialization Format:** JSON or MessagePack

### B. Long-Term Memory (LTM)

- **Purpose:** Persistent knowledge, user facts, known entities, goals, and domain-specific info
- **Scope:** Retained across sessions
- **Storage Options:**
  - `Qdrant` (preferred)
  - `Chroma` / `Weaviate`
  - Fallback: SQLite + embedding index
- **Schema:**

```ts
{
  id: string,
  embedding: number[],
  type: 'fact' | 'event' | 'agent_note' | 'goal' | 'custom',
  content: string,
  metadata: {
    source: string,
    tags: string[],
    timestamp: string
  }
}
```

### C. Episodic Memory

- **Purpose:** Log of past sessions and context segments with timestamps
- **Scope:** Session-indexed logs
- **Storage:** Flat file log (e.g., `.epilog`) or SQLite
- **Searchable By:** Time, tags, query similarity, session ID
- **Used For:** Flashback-like recall, regression context, timeline reconstruction

### D. Semantic Memory

- **Purpose:** Structured, distilled knowledge (concept maps, summaries)
- **Build From:** STM + LTM + external sources
- **Storage:** Embedded documents in vector DB with concept tags
- **Format:** Markdown + JSON metadata
- **Auto-Update:** Background distillation agent refines over time

### E. Working Scratchpad

- **Purpose:** Volatile buffer for temporary notes, planning, and draft generation
- **Scope:** Per-task / per-thread basis
- **Storage:** RAM or ephemeral IndexedDB blob (cleared on session end)

---

## II. Memory Access Layer

### A. Retrieval Engine

- **Input:** Natural language query, embedding vector, or tag query
- **Output:** Ranked list of matching memory entries
- **Strategy:** Hybrid semantic + keyword filtering
- **Boost Factors:**
  - Recency
  - Relevance score
  - Agent trust weight

### B. Injection Mechanism

- **Where Injected:** Prompt preamble or hidden `system_context` field
- **Max Token Budget:** Dynamic, tunable per agent (default: 2,000 tokens)
- **Injection Strategy:**
  - Priority: working memory > short-term > relevant long-term > semantic > episodic
  - Deduplicated and trimmed by relevancy and confidence

### C. Memory Consolidation Agent

- **Purpose:** Periodically summarize and re-embed content
- **Trigger:**
  - End of session
  - Task completion
  - Memory budget overflow
- **Action:**
  - Combine STM + scratchpad into compressed summary
  - Move to LTM if deemed valuable

---

## III. Implementation Notes

### A. `kAI` (Browser Extension / Local Runtime)

- **Short-Term:** IndexedDB / in-memory cache
- **Long-Term:** Local Qdrant or SQLite fallback
- **Ephemeral:** LocalStorage/SessionStorage
- **Config UI:** Enable memory management, pinning, pruning

### B. `kOS` (Mesh / Server / Container)

- **Short-Term:** Redis (or RAM)
- **Long-Term:** Clustered Qdrant or Chroma
- **Semantic/Knowledge Map:** Periodically exported to graph storage
- **Admin API:** Expose endpoints for querying, updating, deleting memory entries

### C. Security & Privacy

- **Encryption:** AES-256 for all at-rest long-term stores
- **Key Derivation:** PBKDF2 + per-user salt
- **Vault Integration:** Secrets never stored in memory index
- **Memory Access Logging:** Optional audit log of memory fetch/inject events

---

## IV. Development Checklist

| 🟩 | Task                                | Description                              |
| -- | ----------------------------------- | ---------------------------------------- |
| 🟩 | LTM schema defined                  | Embedding, metadata, tags                |
| 🟩 | Memory types separated              | STM, LTM, episodic, semantic, scratchpad |
| 🟩 | Injection ordering                  | Priority logic defined                   |
| ⬜  | Consolidation agent spec            | Partial – draft implementation needed    |
| ⬜  | Admin API for `kOS` memory services | Needs endpoints and ACL controls         |

---

### Changelog

– 2025-06-21 • Initial draft for agent memory architecture – 2025-06-22 • Added injection, security, and semantic design sections


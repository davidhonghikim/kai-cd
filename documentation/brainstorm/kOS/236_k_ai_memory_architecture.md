# 236: kAI Memory Architecture

This document defines the architecture and implementation strategy for Kind AI's memory system. It details how short-term, long-term, semantic, episodic, procedural, and auxiliary memory functions are implemented and maintained across all agents and services.

---

## I. Overview

kAI (Kind AI) memory architecture is inspired by a hybrid of human cognitive models and distributed AI systems. It is designed to:

- Store and retrieve relevant contextual knowledge
- Reactivate useful previous interactions
- Store procedures and routines
- Encrypt and protect long-term user data
- Optimize for limited resource environments

---

## II. Memory Layers

### A. Short-Term Memory (STM)

- **Scope**: Session-local, recent interactions (sliding window)
- **Storage**: In-memory (Redis or process memory)
- **Eviction Policy**: LRU or decay-based (per agent type)
- **Use Cases**: Prompt construction, session logic, auto-refresher

### B. Working Memory (WM)

- **Scope**: Active goals, sub-tasks, and threads
- **Storage**: Redis or SQLite (on-device)
- **Format**: JSON schema with expiration and priorities
- **Triggers**: Flush to semantic memory or discard

### C. Episodic Memory

- **Scope**: Chronological events and interactions
- **Storage**: Vector database (Qdrant, Chroma, Weaviate)
- **Embedding**: Sentence-transformers (or LLM-native encoders)
- **Use Cases**: Conversation recall, reflection, session replay

### D. Semantic Memory

- **Scope**: Concepts, facts, user preferences, learned traits
- **Storage**: Vector DB with metadata indexing
- **Embedding**: OpenAI Ada-002, Instructor-Large, or local model
- **Retrieval**: Similarity + tag filtering + contextual relevance

### E. Procedural Memory

- **Scope**: How-to's, workflows, repeatable routines
- **Storage**: YAML/JSON routines + vector index for natural recall
- **Integration**: Tied to agent abilities and task planners
- **Execution**: Can auto-invoke or suggest

### F. Long-Term Vault (LTV)

- **Scope**: Personally Identifiable Information (PII), private preferences, secure config
- **Storage**: AES-256 encrypted SQLite or Vault-managed file
- **Access**: Requires master unlock or biometric
- **Usage**: Used sparingly for privacy reasons

### G. Sensory & Context Memory

- **Scope**: Device signals, app usage, local system state
- **Sources**: OS APIs, browser, smart home, system daemons
- **Usage**: Adjust agent awareness and reaction (e.g., noise, light, GPS)

---

## III. Memory Management Protocols

### A. Pruning & Compression

- **STM/WMT Decay**: Based on context token limits and recency
- **Episodic Compression**: Merge summaries periodically
- **Semantic Memory Audit**: Redundancy cleanup every 24h

### B. Learning & Transfer

- **Cross-Agent Learning**: Shared semantic traits via cluster-wide sync
- **User Consent Check**: Only if explicitly opted-in
- **Procedural Update**: Convert repeated user actions to routines

### C. Annotation

- **Metadata**: All entries have timestamp, tags, source agent
- **User Override**: User can annotate, tag, or redact any memory

---

## IV. Memory Tools & Services

### A. `MemoryIndexer`

- Encodes and stores memory vectors
- Handles re-indexing for updates

### B. `MemoryQuery`

- Performs semantic + symbolic search
- Returns scored matches with context range

### C. `VaultManager`

- Handles encryption, decryption, biometric lock/unlock
- Backup/export options

### D. `ReflectionAgent`

- Periodically reviews episodic memories
- Promotes insights to semantic memory

### E. `RoutineBuilder`

- Detects repeated actions and formalizes them into reusable routines

---

## V. System Integration

### A. Frontend (kAI Interface)

- **Memory Viewer**: UI to inspect/edit memory layers
- **Vault Access**: Master unlock via secure modal
- **Timeline Visualization**: Episodic playback

### B. Backend

- FastAPI services:
  - `/memory/query`
  - `/memory/store`
  - `/memory/vault`
  - `/memory/summarize`
- Auth-required with full audit logging

---

## VI. Data Models

```typescript
// Semantic Memory Entry
interface SemanticMemoryEntry {
  id: string;
  vector: number[];
  tags: string[];
  timestamp: string;
  source: string;
  summary: string;
}

// Episodic Memory Entry
interface EpisodicMemory {
  id: string;
  content: string;
  embedding: number[];
  agentId: string;
  timestamp: string;
}
```

---

## VII. Security & Privacy

- **End-to-End Encryption** for vault storage
- **Biometric Access** options on mobile (FaceID/TouchID)
- **Agent-specific Memory Walls** (data silos)
- **Anonymized Training** on consent-based corpus only

---

## VIII. Future Extensions

- Memory sharing between trusted agents
- Real-time event-based memory tagging
- Dynamic forgetting and synthetic dreams
- Multi-agent memory consensus
- Augmented memory with media (image/audio logs)

---

## IX. Status

| 🟩 | Component              | Status      |
| -- | ---------------------- | ----------- |
| 🟩 | Semantic Memory Core   | Implemented |
| 🟦 | Procedural Learning    | In Progress |
| ⬜  | Vault Biometric Access | Not Started |
| 🟩 | Memory Query Service   | Live        |
| 🟦 | UI Memory Manager      | Prototyping |

---

### Changelog

- 2025-06-20: Initial draft created based on full spec
- 2025-06-21: Added procedural memory and vault logic


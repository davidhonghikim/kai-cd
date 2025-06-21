# 246: Kind AI Semantic Memory & Cognitive Model Design

## Overview

This document details the design of the semantic memory and cognitive model architecture for Kind AI (`kAI`). It ensures the system mimics layered memory functionality inspired by human cognition, while being adaptable to a modular, scalable infrastructure.

---

## Memory Layers

### 1. **Episodic Memory**

- **Purpose**: Track event-based memories with temporal markers
- **Format**: JSON objects with timestamps, agent context, participants, and summary
- **Storage**: Redis (for short-term), PostgreSQL (for long-term)
- **Example Entry**:

```json
{
  "timestamp": "2025-06-25T14:03:21Z",
  "context": "agent://kai-user/voice_assistant",
  "event": "User asked for directions to Amsterdam.",
  "location": "mobile.app.nav",
  "importance_score": 0.75,
  "tags": ["navigation", "voice", "user"]
}
```

### 2. **Semantic Memory**

- **Purpose**: Represent factual knowledge and relationships
- **Backend**: Vector DB (Qdrant or Weaviate) with embeddings indexed by concept
- **Ontology**: Uses `kOS-Core-Ontology` with schema.org + custom domain-specific extensions
- **Embedding Source**: OpenAI, BGE, or local models
- **Retention Policy**:
  - TTL-based expiry for low-ranked data
  - Relevancy reinforcement through usage frequency

### 3. **Procedural Memory**

- **Purpose**: Step-by-step knowledge like "how to" processes
- **Format**: Markdown + JSON + flowgraph hybrid
- **Example**: Task automation scripts, workflows, user habits
- **Storage**: Git-based versioned repos, YAML index

### 4. **Emotional Memory (Optional)**

- **Purpose**: Map emotional resonance of interactions
- **Data**: Emotion score, type (positive/neutral/negative), topic, agent response impact
- **Use Case**: Tuning assistant personality over time

### 5. **Declarative Knowledge**

- **Purpose**: Explicit, user-defined facts and references
- **Input**: Manual entries, uploaded docs, clipped references
- **Search**: Full-text + semantic

---

## Cognitive Model Engine

### Core Modules

- **Perception Unit**: Processes input (voice, text, gesture, etc.) and routes it for understanding
- **Context Tracker**: Maintains conversation, task, and environment state
- **Inference Engine**: Performs reasoning using:
  - Rule-based logic (prolog-like syntax)
  - Prompt-chained LLMs
  - RAG using vector + graph DB
- **Reflection Agent**:
  - Periodically analyzes stored memories
  - Promotes new knowledge
  - Cleans irrelevant or outdated nodes
- **Attention Controller**:
  - Selectively activates memory clusters based on focus/task
  - Includes `kAttention-Protocol` for salience weighing

### Retrieval Strategy

- **Fast path**: Semantic + context ID → vector query
- **Slow path**: Full inference over declarative/procedural memory
- **Hybrid**: Use long-term episodic recall + procedural lookup

---

## Protocols & Interfaces

### Data Schemas

- `MemoryEntry`: Base structure for all memories
- `KnowledgeLink`: Directed edge between facts/objects
- `TaskRoutine`: Procedural memory unit

### APIs

- `/memory/search?q=...`
- `/memory/promote` (convert event → semantic)
- `/memory/annotate`
- `/inference/run?model=...`

### Sync

- `kOS-Sync-Link` to propagate cross-device memory
- Memory pruning and diff sync across edge nodes

---

## Security & Privacy

- **Encryption**: AES-256 for all memory layers
- **Isolation**: Scoped memory containers per user/device/task
- **Redaction**: Manual or auto policies
- **Consent Flow**: Explicit tagging of memories allowed to sync or train

---

## Future Extensions

- **Federated Memory Sharing**: Between trusted agents (e.g. household bots)
- **Explainable Reasoning Layer**: Memory path trace with visual graph UI
- **Memory Replay Engine**: UI playback of historical episodic chains

---

## Status: 🟦 In Progress

---

### Changelog

- 2025-06-25: Initial draft by AI agent


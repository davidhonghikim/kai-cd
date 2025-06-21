# 218: Agent Thread Tree Memory – Persistent Hierarchical State Engine

## Overview

This document defines the architecture, logic, configuration, and implementation strategy for the Agent Thread Tree Memory system in **kAI/kOS**. This subsystem enables multi-agent systems to retain persistent, contextual, and hierarchical memory over threads, conversations, events, and long-term activities.

The memory system is a graph-backed tree of agents, messages, operations, and states. It includes:

- Thread persistence
- Conversational hierarchy
- State-machine embeddings
- Agent-to-agent memory links
- Dynamic memory pruning and compression
- Intent tagging and topic classification
- Real-time context recall and memory injection

---

## Directory Structure

```
kai-core/
├── memory/
│   ├── thread_tree/
│   │   ├── __init__.py
│   │   ├── models.py          # DB models for threads, nodes, context
│   │   ├── schema.py          # Pydantic schema
│   │   ├── processor.py       # Memory injection / summarization logic
│   │   ├── recall.py          # Memory search / retrieval tools
│   │   ├── pruner.py          # Compression & deletion engine
│   │   ├── embeddings.py      # Vector embedding support
│   │   ├── graph.py           # Directed graph engine
│   │   └── config.py          # Configuration and memory budgets
```

---

## Models (`models.py`)

```python
class Thread(Base):
    id: UUID
    title: str
    root_node_id: UUID
    created_at: datetime
    updated_at: datetime

class ThreadNode(Base):
    id: UUID
    thread_id: UUID
    parent_node_id: UUID
    agent_id: str
    role: str  # user / assistant / system / observer / critic
    content: str
    state_snapshot: dict  # current memory, variables, states
    vector: list[float]  # embedding
    created_at: datetime

class AgentLink(Base):
    from_agent: str
    to_agent: str
    metadata: dict
    notes: str
```

---

## Capabilities

- 🧠 **Thread-Persistent Memory**: Every conversation and process is stored as a unique thread, retaining past states.
- 🌲 **Hierarchical Context**: Message trees enable forked reasoning, review, and agent critique.
- 🔁 **Linked Recall**: Agents can cross-reference memory from other agents via the `AgentLink` graph.
- 🔍 **Context-Aware Retrieval**: Relevance scoring using cosine similarity + metadata filtering.
- 📉 **Dynamic Compression**: Prune, compress, or summarize old memory to fit budgets.
- 🗂️ **Context Bucketing**: Intent and topic classifiers assign tags for efficient retrieval.

---

## Embeddings & Retrieval (`recall.py` / `embeddings.py`)

- Uses **OpenAI**, **Instructor**, or **SentenceTransformers**
- Hybrid scoring:
  - **Vector cosine similarity**
  - **Recency weighting**
  - **Agent affinity boosts**
- Retrieval query includes:
  ```json
  {
    "thread_id": "uuid",
    "current_prompt": "text",
    "agent_id": "kai.user001",
    "context_tags": ["system", "scheduling"]
  }
  ```
- Returns compressed list of relevant ThreadNodes

---

## Summarization / Pruning (`pruner.py`)

- Uses windowed compression via:
  - LangChain summarizers
  - Prompt template reduction
  - Hash window deduplication
- Triggered by:
  - Node count over threshold
  - Time decay
  - User/agent event hook
- State snapshots are preserved, compressed, and hashed for versioning

---

## Injection & Live Context (`processor.py`)

- On each prompt run, this module:
  - Pulls relevant memory chunks
  - Classifies current intent
  - Injects the memory block inline
  - Preserves memory lineage tree (like git commits)

```ts
// Example:
--- memory_injected_start ---
[RECALL: Prior event summary for "Calendar sync error"]
...
--- memory_injected_end ---
User: "Try syncing again and update my Google calendar."
```

---

## Agent Collaboration via Memory Links

- Agents link memory trees via `AgentLink`
- Enables decentralized, yet coherent agent collaboration
- Memory exchange can be regulated via `TrustTokens`, access controls, or time-limited availability

---

## Configuration (`config.py`)

```yaml
THREAD_MEMORY_LIMIT: 512  # nodes per thread
NODE_MAX_LEN: 2048        # max content tokens
EMBEDDING_MODEL: "instructor-large"
DEFAULT_SUMMARIZER: "map_reduce"
PRUNE_STRATEGY: "time_decay"
CACHE_EMBEDDINGS: true
AGENT_CONTEXT_FILTERING: true
ALLOW_CROSS_AGENT_RECALL: true
```

---

## Future Plans

- ⏱️ Temporal memory shaping (spaced repetition, decay models)
- 🎓 Fine-tuned embeddings per agent profile
- 🕵️ Memory transparency and diff visualization
- 🧩 Plugin memory graphs (e.g. agent plugins can store long-term notes)
- 🔐 Memory privacy permissions per agent / owner

---

**Status:** ✅ Ready for agent implementation.

Next doc: `219: Vector Database Integration – Config, Strategies, and Agent Access Layer`


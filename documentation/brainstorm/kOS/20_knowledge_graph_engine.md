# 20: Knowledge Graph Engine (kAI/kOS)

This document specifies the architecture, components, and configuration of the Knowledge Graph Engine used within Kind AI (kAI) and Kind OS (kOS). This system enables dynamic knowledge modeling, semantic linking, and graph-based memory/context retrieval for agents and users.

---

## I. Purpose

The Knowledge Graph Engine (KGE) enhances contextual intelligence across kAI and kOS. It provides:

- Rich, relational memory for agents and user entities
- Semantic search and inference
- Contextual awareness for dialogue, decision making, and personalization

---

## II. Directory Structure

```text
src/
├── core/
│   └── knowledge/
│       ├── engine/
│       │   ├── GraphBuilder.ts           # Converts entities and text into graph nodes/edges
│       │   ├── GraphUpdater.ts           # Handles real-time updates and persistence
│       │   ├── GraphInferencer.ts        # Runs ontological and semantic inferences
│       │   └── GraphQuery.ts             # Interfaces for queries and traversal
│       ├── schemas/
│       │   ├── node.schema.ts            # Node structure and types
│       │   └── edge.schema.ts            # Edge structure and semantics
│       └── config/
│           └── graph_config.yaml         # Engine-level config and tunables
```

---

## III. Backend Stack

- **Database**: Neo4j (Alt: TerminusDB, Dgraph)
- **ORM/Adapter**: `neo4j-driver` + custom adapters
- **Inference Engine**: Rule-based + optional ML classifier plugin (BERT-based)
- **Graph Format**: Property Graph (labeled nodes + directed edges)

---

## IV. Data Model

### A. Nodes (`node.schema.ts`)

```ts
export interface GraphNode {
  id: string;
  type: 'person' | 'fact' | 'concept' | 'agent' | 'place' | 'goal' | 'event';
  label: string;
  properties: Record<string, any>;
  vectorEmbedding?: number[];
}
```

### B. Edges (`edge.schema.ts`)

```ts
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'knows' | 'related_to' | 'causes' | 'part_of' | 'says' | 'asks' | 'answers' | 'follows' | 'owned_by';
  confidence?: number;
  createdAt: string;
  meta?: Record<string, any>;
}
```

---

## V. Core Features

### A. Entity Extraction & Graph Construction

- NER/NLP pipeline powered by spaCy + LLM fallback
- Extracts relationships and entities from:
  - Prompts
  - Memory logs
  - Conversations
  - External sources (web, APIs)

### B. Embedding & Vector Linking

- Each node optionally contains a vector (`vectorEmbedding`) for similarity search
- Stored in external vector DB (Qdrant/Chroma)
- Synced via `GraphBuilder`

### C. Relevance & Context Retrieval

- Query `GraphQuery.ts` for:
  - Top-N related nodes to a goal/person/topic
  - Path discovery: what leads from user to desired outcome
  - Reverse lookup: who/what caused X?

### D. Inference Rules

- Rule engine supports:
  - Chain of causality
  - Hierarchical generalization
  - Behavioral trends
  - Timeline-based correlation

---

## VI. Configuration (`graph_config.yaml`)

```yaml
storage_backend: neo4j
embedding_provider: openai
vector_db: qdrant
update_interval: 30s
max_node_age: 365d
confidence_decay: true
```

---

## VII. API Usage Examples

### A. Build Graph from Text

```ts
await graphBuilder.ingestText('Alice knows Bob and works at Acme Corp.', {
  source: 'memory.log',
  confidence: 0.9,
});
```

### B. Query Related Facts

```ts
const links = await graphQuery.getRelated('node-id-alice', 'person', {
  relationTypes: ['knows', 'works_at'],
  maxDepth: 2,
});
```

### C. Run Inference

```ts
const result = await graphInferencer.runRuleChain('cause-effect', 'node-id-symptom');
```

---

## VIII. Visualization

- Uses Cytoscape.js for UI rendering in dashboards
- Custom layout for agent-centered graphs
- Supports highlighting by:
  - Confidence
  - Freshness
  - Domain (health, memory, system)

---

## IX. Future Roadmap

| Feature                   | Version |
| ------------------------- | ------- |
| Temporal Reasoning Layer  | v1.2    |
| Federated Graph Sync      | v1.3    |
| Natural Language Queries  | v1.4    |
| Fine-grained ACL per node | v1.5    |


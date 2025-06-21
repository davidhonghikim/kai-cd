# 18: Vector Database Manager

The Vector Database Manager coordinates all operations related to embedding storage, similarity search, and memory chunking across the kOS/kAI ecosystem. It provides a unified interface to manage multiple backend vector stores and supports advanced indexing, tagging, and routing features.

---

## I. Purpose

- Serve as a backend-agnostic interface for similarity search and retrieval-augmented generation (RAG)
- Support multi-agent memory graphs, temporal embedding snapshots, and context chunking pipelines
- Facilitate dynamic routing of embeddings across different databases for scale, redundancy, or locality

---

## II. Directory Structure

```text
src/
└── core/
    └── vector_db/
        ├── index_router/
        │   ├── IndexRouter.ts              # Routes based on namespace/tags
        │   └── RouterConfig.ts             # Rules for routing
        ├── clients/
        │   ├── QdrantClient.ts
        │   ├── WeaviateClient.ts
        │   ├── ChromaClient.ts
        │   ├── PineconeClient.ts
        │   └── LocalFAISSClient.ts
        ├── embedding_chunker/
        │   ├── HtmlChunker.ts
        │   ├── MarkdownChunker.ts
        │   ├── TextSplitter.ts
        │   └── ChunkMetadata.ts           # Embedding metadata schema
        ├── VectorDBManager.ts             # Main interface (init, insert, search, delete)
        └── vector_config.yaml             # Default DB configs & priority order
```

---

## III. Supported Backends

### A. Self-Hosted

- **Qdrant**
- **Weaviate**
- **Chroma**
- **FAISS (Local only)**

### B. Managed Services

- **Pinecone**
- **Qdrant Cloud**
- **Weaviate Cloud**

---

## IV. Embedding & Chunking Pipeline

1. **Text Input Received** (e.g. from document, conversation, webpage)
2. **TextSplitter** breaks text into configurable-size chunks (overlap supported)
3. **ChunkMetadata** appended (timestamp, source, agent, tags, persona)
4. **Embedding Model** selected (default: OpenAI Ada-002 or local BGE-small)
5. **Embedding Sent to VectorDBManager.insert()**
6. **IndexRouter** selects DB and namespace using rules in `RouterConfig`

---

## V. IndexRouter & Routing Logic

### RouterConfig.yaml (example):

```yaml
namespaces:
  - name: personal_memory
    backend: qdrant
    replication: 2
    tags:
      - private
      - self

  - name: docs_corporate
    backend: pinecone
    min_vector_size: 1536
    rules:
      if_source: "*.corpnet.local"
      agent: "admin"
```

### Route Decision Factors:

- Namespace
- Vector dimensionality
- Source domain (e.g. file, email, web)
- Security level (private, shared, public)
- Persona access (e.g. child agent cannot access adult corpus)

---

## VI. API Reference

```ts
await vectorDB.insertEmbedding({
  namespace: 'personal_memory',
  content: 'You said you love sea otters.',
  metadata: { userId: '123', agent: 'kai', source: 'chat' }
})

await vectorDB.queryEmbedding({
  namespace: 'personal_memory',
  query: embedding,
  topK: 5
})

await vectorDB.deleteEmbedding({
  namespace: 'personal_memory',
  tag: 'expired',
  before: '2025-01-01'
})
```

---

## VII. Vector Config File

`vector_config.yaml`

```yaml
default_backend: qdrant
embedding_model: bge-small-en
chunking:
  size: 400
  overlap: 40
  strategy: sliding
replication: true
fallback: chroma
```

---

## VIII. Access Control & Privacy

- **Embedding Tagging** for access levels (`private`, `internal`, `public`)
- **Persona-scoped Retrieval** (e.g. child's agent can't query adult memories)
- **Temporal Indexing** for time-based forgetting or decay
- **Audit Logs** per insertion and query

---

## IX. Planned Extensions

| Feature                      | Target Version |
| ---------------------------- | -------------- |
| Encryption-at-Rest for Local | v1.2           |
| Multi-embedding Support      | v1.3           |
| Vector Ops Visualizer UI     | v1.4           |
| Embedding Sync & Diff Tool   | v1.5           |

---

### Changelog

- 2025-06-21: Initial low-level specification for embedding and vector management across distributed storage backends.


# 219: Vector Database Integration – Config, Strategies, and Agent Access Layer

This document defines the full structure, configuration, and implementation details for vector database integration across all KindOS (kOS) and KindAI (kAI) modules. This supports document retrieval, contextual memory, RAG workflows, and embedding-based search and classification.

---

## 1. Directory Structure

```text
/kOS/
  services/
    vector/
      __init__.py
      config.py
      router.py
      controller.py
      client_qdrant.py
      client_chroma.py
      client_pinecone.py
      client_weaviate.py
      embeddings.py
      schema.py
      agent_adapter.py
      vector_utils.py
      vector_indexer.py
      vector_query.py
  
  config/
    vector_settings.yaml
  
  agents/
    memory/
      vector_memory_adapter.py
      persistent_memory_cache.py
      memory_lookup.py

/kAI/
  plugins/
    vector_integration/
      plugin.json
      plugin.ts
      hook_vector_query.ts
      hook_vector_insert.ts
```

---

## 2. Supported Vector DBs

### ✅ Supported
- Qdrant (local + cloud)
- ChromaDB
- Pinecone
- Weaviate

### 🧪 Optional (Future)
- Milvus
- Elasticsearch w/ dense vector plugin

---

## 3. Configuration

### `vector_settings.yaml`
```yaml
default_provider: qdrant
vector_dim: 1536
embedding_model: openai/text-embedding-ada-002
retry_limit: 3
connection_timeout: 10
active_databases:
  - qdrant
  - chroma
  - pinecone
  - weaviate

[qdrant]
host: "localhost"
port: 6333
api_key: ""
https: false

[chroma]
persist_directory: "/data/chroma"

[pinecone]
api_key: "your-api-key"
environment: "us-west1-gcp"

[weaviate]
host: "http://localhost:8080"
scheme: "http"
auth: false
```

---

## 4. Embeddings

### Supported Providers
- OpenAI
- Hugging Face (sentence-transformers)
- Ollama (local LLM embeddings)
- Local models via `InstructorEmbedding`, `all-MiniLM`, `bge-base`

### Adapter: `embeddings.py`
```python
class EmbeddingAdapter:
    def __init__(self, model_name):
        # Initialize model by name

    def embed_text(self, text: str) -> List[float]:
        # Return embedding vector
```

---

## 5. Indexing Workflow

### File: `vector_indexer.py`
```python
def index_document(doc_id, text, metadata, namespace="default"):
    embedding = embed_text(text)
    client = get_vector_client()
    client.insert(doc_id=doc_id, vector=embedding, metadata=metadata, namespace=namespace)
```

- Supports chunking with windowing/sliding overlap
- Embedding deduplication via hash
- Metadata includes source, type, owner, tags, permissions

---

## 6. Query Workflow

### File: `vector_query.py`
```python
def query_vector(text_query, top_k=5):
    embedding = embed_text(text_query)
    client = get_vector_client()
    results = client.query(vector=embedding, top_k=top_k)
    return results
```

### Advanced Options
- Similarity metric selection: cosine, dot, Euclidean
- Namespace scoping
- Per-user memory segmentation
- ACL-aware filtering

---

## 7. Agent Integration

### Memory Adapter
File: `vector_memory_adapter.py`
```python
class VectorMemoryAdapter:
    def store_memory(self, agent_id, text):
        # Index with agent-specific namespace

    def retrieve_memory(self, agent_id, query):
        # Query agent-specific namespace
```

### Plugin Hooks in kAI
- `hook_vector_query.ts`
- `hook_vector_insert.ts`
- Registered via plugin manifest
- Connects frontend search memory UI to backend

---

## 8. Admin Utilities

### `/services/vector/vector_utils.py`
- Prune by age or score
- Rebuild index
- Vacuum unused namespaces
- Stats on vector density and usage

---

## 9. Permissions and Privacy
- All inserts are tagged with user_id and optional agent_id
- Queries filter by user context unless global override
- Supports public vs private document marking
- Embed + index encryption roadmap for kOS secured nodes

---

## 10. Testing & Validation

### Tools
- `pytest`
- `pytest-mock`
- `faker`
- `httpx`

### Scenarios
- Index large doc + query accuracy
- Vector mismatch resilience
- Namespace leakage prevention
- Per-agent memory fidelity

---

## 11. Future Enhancements
- Multi-vector routing (semantic + keyword hybrid)
- Ranking refinement model
- Client-initiated vector feedback
- Secure enclaves for confidential memory

---

✅ This document now fully defines the implementation and operational requirements of the vector database subsystem in both kOS and kAI environments.


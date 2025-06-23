# kOS Agent Memory Engine

This module handles structured memory access, embedding storage, and Codex-tagged recall for kOS agents. It abstracts over ChromaDB, Weaviate, and Postgres layers, providing flexible persistence and search.

---

## 🔧 File: `agent_memory.py`
```python
from chromadb import Client as ChromaClient
import psycopg2
import os

class AgentMemory:
    def __init__(self, namespace):
        self.namespace = namespace
        self.vector = ChromaClient().get_or_create_collection(namespace)
        self.pg = psycopg2.connect(
            dbname=os.getenv("PG_DB"),
            user=os.getenv("PG_USER"),
            password=os.getenv("PG_PASS"),
            host=os.getenv("PG_HOST"),
        )

    def store(self, id, embedding, metadata):
        self.vector.add(documents=[metadata], ids=[id], embeddings=[embedding])

    def query(self, embedding, k=5):
        return self.vector.query(query_embeddings=[embedding], n_results=k)

    def log_text(self, text, tags=[]):
        cur = self.pg.cursor()
        cur.execute("INSERT INTO logs (text, tags) VALUES (%s, %s)", (text, tags))
        self.pg.commit()
```

---

## 🧠 Features
- Dual storage: vector search + relational logs
- Namespaced per agent or tribe
- Tags aligned with Codex compliance
- Real-time insert + async query interface (future upgrade)

---

## 🗃️ Example Usage
```python
memory = AgentMemory("agent.receptionist")
memory.store("msg001", embed(msg), {"sender": "user123", "topic": "login"})
memory.log_text("Started session", tags=["session", "info"])
```

---

## ✅ Next Module:
Generate `ui_server.py` (FastAPI base) or the `web/src/App.js` portal frontend?


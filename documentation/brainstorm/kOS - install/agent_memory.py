# ==============================================
# kOS Agent Memory Interface
# ==============================================
# Connects agents to vector DBs and structured DBs for RAG2 workflows
# Supports: ChromaDB, Weaviate, PostgreSQL
# ==============================================

import os
import chromadb
import psycopg2
from weaviate import Client as WeaviateClient

class AgentMemory:
    def __init__(self, backend="chroma"):
        self.backend = backend
        self.client = None
        self.init_connection()

    def init_connection(self):
        if self.backend == "chroma":
            self.client = chromadb.Client()
        elif self.backend == "weaviate":
            self.client = WeaviateClient("http://localhost:8080")
        elif self.backend == "postgres":
            self.client = psycopg2.connect(
                dbname=os.getenv("POSTGRES_DB", "kosdb"),
                user=os.getenv("POSTGRES_USER", "kos"),
                password=os.getenv("POSTGRES_PASSWORD", "secret"),
                host="localhost",
                port="5432"
            )
        else:
            raise ValueError(f"Unsupported memory backend: {self.backend}")

    def store(self, namespace, input_text, embedding=None):
        if self.backend == "chroma":
            self.client.get_or_create_collection(namespace).add(documents=[input_text])
        elif self.backend == "weaviate":
            self.client.data_object.create({"text": input_text}, class_name=namespace)
        elif self.backend == "postgres":
            cur = self.client.cursor()
            cur.execute("INSERT INTO memory (namespace, content) VALUES (%s, %s)", (namespace, input_text))
            self.client.commit()

    def query(self, namespace, query_text, k=5):
        if self.backend == "chroma":
            return self.client.get_collection(namespace).query(query_text, k)
        elif self.backend == "weaviate":
            return self.client.query.get(namespace, ["text"]).with_near_text({"concepts": [query_text]}).with_limit(k).do()
        elif self.backend == "postgres":
            cur = self.client.cursor()
            cur.execute("SELECT content FROM memory WHERE namespace = %s ORDER BY id DESC LIMIT %s", (namespace, k))
            return cur.fetchall()

# Example usage
if __name__ == "__main__":
    memory = AgentMemory("chroma")
    memory.store("demo", "Hello world memory")
    print(memory.query("demo", "Hello"))

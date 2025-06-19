# 19_ServicesVectorSearch.md
# ChatDemon Service Integration Guide - Vector Search
**Title:** Service Integration Guide - Vector Search

**Overview:** This guide outlines integrating vector search services with ChatDemon.

**Goal:** Enable semantic search and retrieval of information using vector embeddings.

**Supported Services:**

*   Milvus: Connects to a Milvus instance.
*   Qdrant: Connects to a Qdrant instance.
*   Weaviate: Connects to a Weaviate instance.

**Connector Implementation:**

```typescript
interface VectorSearchConnector {
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    createCollection(name: string, dimension: number): Promise<void>;
    search(collectionName: string, queryVector: number[], topK: number): Promise<SearchResult[]>; // Perform vector search
    getSettings(): Promise<VectorSearchSettings>;
    updateSettings(settings: VectorSearchSettings): Promise<void>;
    getErrorMessage(): string | null;
}
interface SearchResult {
   id: string;
   score: number;
   payload?: any;  // Any metadata associated

Implementation Notes:
Each service will have different options for the API such as authentication, vector index creation and more
Default Configuration:
Milvus:
* ID: milvus
* Name: Milvus Connection
* URL: http://localhost:19530 (default)
* API Key: None
* Active: false
Workflow for Searches
The user can input the search and query to the backend from the UI
Select from a service to search and search with the API
Results get added and returned to the UI
Error Handling:
Implement validation to API keys.
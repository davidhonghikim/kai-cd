# 🔎 09: Services - Vector Search

This document outlines the planned integration of vector search and database services like ChromaDB, Milvus, and Qdrant.

*(Note: This is a placeholder document. The features described here are planned but not yet implemented.)*

## Core Capability: `vector_database`

To provide a unified interface for interacting with vector databases, a new capability, `vector_database`, will be used.

### `vector_database` Capability Schema
- `capability`: `'vector_database'`
- `endpoints`:
    - `listCollections`: Get a list of all available collections/indices.
    - `query`: Perform a similarity search within a collection.
    - `upsert`: Add or update documents/vectors in a collection.
    - `delete`: Remove documents from a collection.
- `parameters`:
    - *query*:
        - `collection_name`: The collection to search in.
        - `query_texts`: The text(s) to search for.
        - `n_results`: The number of results to return.
    - *upsert*:
        - `collection_name`: The collection to add to.
        - `documents`: The text documents to add.
        - `metadatas`: Associated metadata for each document.
        - `ids`: Unique IDs for each document.

## Planned Integrations
- ChromaDB
- Milvus
- Qdrant

## Design Considerations
- *Embedding Model Agnostic:* The UI should allow users to provide vectors directly or provide text to be converted to vectors by a separate, user-selected embedding service.
- *Unified Query Interface:* The goal is to abstract the differences between the various vector DB APIs to provide a single, consistent query interface. 
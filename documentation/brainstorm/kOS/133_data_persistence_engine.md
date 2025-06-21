# 133: Data Persistence Engine – Vault, VDB, Logs, Snapshots, and Streams

This document outlines the full specification and implementation plan for the Data Persistence Engine in the `kAI` and `kOS` systems. It defines secure storage layers, short- and long-term memory systems, event recording, and time-based snapshotting mechanisms.

---

## I. Overview

The Data Persistence Engine ensures that:

- All memory, events, and agent outputs are durably stored
- State can be restored precisely from snapshots
- Secure and high-performance logging is available
- Vaulted secrets and configs are cryptographically protected
- Vector data stores are kept in sync with agent embeddings
- Data can be streamed live to external processors or archives

---

## II. Core Components

### 1. Secure Vault

- **Encryption:** AES-256-GCM
- **Key Derivation:** PBKDF2 (100K iterations)
- **Storage Format:** Encrypted JSON or FlatBuffers
- **Mount Path:** `/data/vault/`
- **Usage:**
  - API keys
  - Master agent configs
  - Authentication tokens
  - PII redacted memory caches

### 2. Vector Memory Database (VDB)

- **Supported Backends:**
  - Self-hosted: Qdrant, Chroma, Weaviate
  - Cloud: Pinecone, Milvus, Chroma Cloud
- **Embedding Sync Agent:**
  - Real-time sync of new vector records from agent memory
  - Supports batched and streaming modes
- **Schema:**
  ```json
  {
    "id": "uuid",
    "embedding": [float],
    "metadata": {
      "agent_id": "uuid",
      "timestamp": "RFC3339",
      "context": "chat | workflow | doc",
      "tags": ["str"]
    }
  }
  ```

### 3. Structured Logs

- **Transport:** Local filesystem + Logstash (optional)
- **Format:** JSON Lines (`.log.jsonl`)
- **Retention:** Configurable via `logging.yaml`
- **Schema:**
  ```json
  {
    "timestamp": "2025-06-21T20:55:00Z",
    "agent": "kAI.dev.assistant",
    "event": "plan_generated",
    "summary": "Plan created for task: draft UI skeleton"
  }
  ```

### 4. Snapshots

- **Types:**
  - Full system state
  - Agent context and memory
  - Conversation logs + memory window
- **Trigger Conditions:**
  - User manual
  - Auto-timer
  - Major change (e.g., code push, patch merge)
- **Storage:** `/data/snapshots/YYYY-MM-DDTHHMMSSZ/`
- **Format:** Zip with manifest.json
- **Restoration:** Hot-reload support via kAI Core Service

### 5. Stream Broker

- **Supported Streams:**
  - Live chat event streams
  - Agent log sinks
  - Metric counters and dashboards
- **Protocols:**
  - WebSocket
  - NATS
  - Kafka (future)
- **Access Control:**
  - Token-based
  - Role-based ACL
- **Consumer Types:**
  - External dashboards
  - Third-party processors
  - Forensic log aggregators

---

## III. Config Files

### `vault_config.yaml`

```yaml
vault:
  enabled: true
  mount_path: /data/vault/
  encryption: aes-256-gcm
  kdf: pbkdf2
  auto_lock_timeout: 15m
```

### `logging.yaml`

```yaml
logging:
  level: info
  output: /data/logs/kai.log.jsonl
  max_days: 30
  rotate_size_mb: 100
```

### `vector_config.yaml`

```yaml
vector:
  provider: qdrant
  host: localhost
  port: 6333
  sync_interval: 30s
  embedding_model: text-embedding-ada-002
```

---

## IV. Directory Layout

```
/data/
├── vault/
│   └── master-config.enc.json
├── logs/
│   └── kai.log.jsonl
├── snapshots/
│   └── 2025-06-21T201500Z/
│       ├── manifest.json
│       └── memory_window.json
├── vectors/
│   └── agent_memory.qdrant
└── streams/
    └── live_events.ws
```

---

## V. Future Features

- Real-time diff-based snapshot compression
- Zero-trust vault unsealing with biometric + OTP
- VDB sharding and hierarchical memory decay pruning
- Time-series embedded memory heatmaps

---

### Changelog

– 2025-06-21 • Initial architecture and config draft


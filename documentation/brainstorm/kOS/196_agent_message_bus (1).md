# 196: Agent Message Bus and Event Pipeline (KMB)

## Overview

The **Kind Message Bus (KMB)** is a core architectural component of the kAI/kOS ecosystem. It provides a decentralized, modular, and extensible system for event communication, state propagation, service messaging, and task dispatch across all agents and system modules.

KMB supports plug-and-play message handlers, durable and ephemeral messages, topic subscriptions, routing layers, and local or distributed deployment. It serves as the real-time nervous system of kAI.

---

## 🎯 Objectives

- Enable agents, services, and users to publish/subscribe to structured events
- Provide a secure, traceable, low-latency communication layer
- Allow for modular interceptors, plugins, and custom protocol handlers
- Support both centralized (single-node) and federated multi-node deployment

---

## 🔌 Core Components

### 1. **KMB Broker**

Handles message routing, delivery guarantees, durability (when enabled), and topic management.

**Implementation (Default):**

- Python FastAPI + Redis Streams (ephemeral) and/or PostgreSQL (durable)
- Optional: NATS, MQTT, Kafka backends (swappable adapter layer)

### 2. **KMB Client SDKs**

Lightweight libraries used by agents, apps, and services to connect to the bus.

- Language Support: Python, TypeScript, Go, Rust
- Features:
  - `publish(topic, message, metadata)`
  - `subscribe(topic, handler)`
  - `ack(message_id)`
  - `transformers`, `middleware`, `hook()` support

### 3. **Topic Registry**

Registry of named topics, formats, and schema contracts for validation.

- Enforced with JSON Schema or Protobuf
- Supports topic versioning (v1, v2, etc.)

### 4. **Security Layer**

- JWT-authenticated clients
- Topic-based access control
- Encrypted channels via TLS
- Message signing (Ed25519)

### 5. **DevTools & Dashboard**

- Web UI for tracing, debugging, replaying, inspecting live events
- CLI: `kmbctl topics`, `kmbctl publish`, `kmbctl tail`

---

## 📦 Message Format

```json
{
  "id": "uuid4",
  "timestamp": "2025-06-20T15:42:00Z",
  "topic": "agent.health.heartbeat",
  "payload": {
    "agent_id": "agent.alpha.1",
    "status": "healthy"
  },
  "metadata": {
    "trace_id": "xyz-123",
    "auth": {
      "issuer": "kOS",
      "client_id": "kind-client"
    }
  }
}
```

---

## 📡 Message Types

- `event` – One-way broadcast (fire-and-forget)
- `command` – Request for execution (`ACK`, `ERROR`, `DONE`)
- `query` – Request for data with response (`data`, `error`, `not_found`)
- `transactional` – Multi-phase with rollback support

---

## 🌐 Topic Hierarchies

Topics follow hierarchical namespacing conventions:

```
kmb.agent.lifecycle
kmb.agent.error
kmb.agent.intent.create
kmb.agent.intent.complete
kmb.service.status
kmb.ui.command.button.click
```

Supports:

- `*` for single segment wildcard
- `#` for recursive wildcard

---

## 🧠 Advanced Features

- **Message Transform Pipelines**: Dynamic mutation, logging, replication
- **Message Replay**: For audit/debug
- **Outbox Pattern**: Durable write, async dispatch
- **Dead Letter Queue**: Store failed or rejected messages
- **Replayable Snapshots**: For stateful agents
- **Rate limiting / Throttling**: Topic or client-based

---

## ⚙️ Configuration Example (FastAPI + Redis)

```yaml
kmb:
  backend: redis
  redis_url: redis://localhost:6379
  durability: false
  tls: true
  auth:
    jwt_secret: SUPERSECRET
  topic_registry:
    path: ./topics/
```

---

## 🧩 Integration Points

- kAI Agents use KMB to send/receive all messages
- kOS System UI reacts to KMB events
- Vector stores listen for `vector.upsert`
- kVault publishes `vault.secret.accessed`
- Prompts and workflows emitted via `prompt.issued`, `workflow.started`

---

## 📚 Future Extensions

- Federation across multiple kOS devices or agents
- WebRTC or Reticulum-compatible transports
- CRDT-based sync messages for offline collaboration
- Integration with KindLink Protocol (KLP)

---

## 📘 Related Documents

- `197_KLP_Kind_Link_Protocol.md`
- `175_kAI_Architecture.md`
- `122_Agent_Scheduler.md`
- `119_Event_Taxonomy.md`


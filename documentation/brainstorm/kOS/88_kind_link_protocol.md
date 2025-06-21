# 88: kAI/kOS Agent Communication & Messaging Protocols (KLP - Kind Link Protocol)

This document defines the official communication and messaging specification used by agents within the Kind AI (kAI) and Kind OS (kOS) ecosystem, known as the Kind Link Protocol (KLP).

---

## I. Overview

**KLP** is a modular, extensible, and secure protocol layer for inter-agent communication. It supports both real-time and asynchronous messaging, and is optimized for:

- Peer-to-peer decentralized networks
- Cloud-based microservices
- Localhost embedded agents
- Secure multi-agent orchestration

---

## II. Message Envelope Schema

```json
{
  "klp_version": "1.0.0",
  "timestamp": "2025-06-20T14:22:51Z",
  "message_id": "uuid-1234",
  "sender_id": "agent.kai.user.dashboard",
  "recipient_id": "agent.kos.network.router",
  "msg_type": "COMMAND|RESPONSE|EVENT|STREAM|ERROR",
  "content_type": "application/json",
  "encrypted": true,
  "signature": "base64-signature",
  "payload": "base64-encoded-payload"
}
```

### Definitions

- ``: Protocol version string.
- ``: ISO timestamp for temporal ordering.
- ``: Unique message identifier (UUID).
- ``** / **``: Fully qualified agent IDs (hierarchical).
- ``: Standard enum (`COMMAND`, `RESPONSE`, `EVENT`, `STREAM`, `ERROR`).
- ``: MIME type of decoded payload.
- ``: Boolean, true if payload is encrypted.
- ``: Digital signature of the raw payload.
- ``: Base64 encoded data; must be decrypted + parsed per `content_type`.

---

## III. Transport Layers Supported

| Layer        | Protocol                  | Notes                         |
| ------------ | ------------------------- | ----------------------------- |
| Local        | IPC, Shared Mem           | Used for co-hosted agents     |
| HTTP(S)      | REST + Webhooks           | Web-facing agents             |
| WebSockets   | WS/SecureWS               | Real-time duplex channels     |
| MeshNet      | Reticulum                 | LoRa, encrypted TCP, BLE mesh |
| Queue/Stream | Redis Streams, NATS, MQTT | Async agent comms             |

---

## IV. Payload Schema (Examples)

### COMMAND

```json
{
  "command": "generate_summary",
  "args": {
    "document_id": "xyz-123",
    "summary_length": "short"
  }
}
```

### RESPONSE

```json
{
  "status": "success",
  "result": {
    "summary": "This is a short summary..."
  }
}
```

### EVENT

```json
{
  "event_name": "new_file_uploaded",
  "data": {
    "filename": "notes.pdf",
    "uploader": "user.kai.home"
  }
}
```

### ERROR

```json
{
  "code": 403,
  "message": "Unauthorized",
  "details": "Missing auth token"
}
```

---

## V. Identity & Routing

- Agent IDs are hierarchical and DNS-style: `agent.kai.user.name`, `agent.kos.swarm.node12`
- Routing is performed via agent registries and TrustLinkGraph topology
- Offline agents cache and retry delivery using local queues

---

## VI. Security & Trust

### Cryptographic Stack:

- **Encryption:** AES-256-GCM (symmetric), RSA-4096 / ECC (asymmetric)
- **Signature:** SHA3-512 HMAC or PGP-compliant signatures
- **Keys:** Rotated via `trustlink.keys.rotate`
- **Nonce:** Included with every payload

### Message Protections:

- Tamper-proof audit trails
- Expiring payloads (`expires_at` field)
- Optional challenge-response handshake per message

---

## VII. Agent Capabilities Declaration

Each agent must expose a `GET /.well-known/klp.json` describing:

```json
{
  "agent_id": "agent.kai.user.notetaker",
  "capabilities": ["llm_chat", "file_summarizer", "storage_uploader"],
  "public_key": "base64-key",
  "endpoints": ["ws://localhost:8700", "http://localhost:8000/api"]
}
```

---

## VIII. Compliance Requirements

To be KLP-compatible, an agent must:

- Respond to ping (`msg_type: COMMAND`, `command: ping`)
- Support encrypted + signed payloads
- Publish and refresh `klp.json` endpoint
- Handle version upgrades with `klp_upgrade_notice` events

---

## IX. Future Work

- Quantum-safe encryption fallback
- Compression codecs (`zstd`, `brotli`)
- Forward Error Correction (mesh lossy modes)
- Agent-to-Agent Authentication via zk-SNARKs
- Multi-agent multicast envelope (topic-based addressing)

---

### Changelog

- 2025-06-20 • Initial KLP spec drafted


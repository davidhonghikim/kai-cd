# 132: Agent Communication Bus – Local, Networked, and Mesh Messaging

This document defines the architecture, protocols, implementations, and use cases for the Agent Communication Bus (ACB) within the `kAI` and `kOS` ecosystem. It supports communication between agents across local systems, local networks, mesh topologies, and the open internet.

---

## I. Purpose

The ACB allows agents to:

- Send messages to other agents (local and remote)
- Subscribe to and emit events
- Coordinate actions across machines and networks
- Maintain a shared pub/sub event stream
- Support privacy-aware, secure communication

---

## II. Architecture Overview

### Core Components:

1. **ACB Core Dispatcher**\
   Handles message routing and protocol translation.

2. **Local Event Bus**\
   Fast, in-memory publish-subscribe system for local agent events.

3. **Networked Message Relay**\
   Uses secure WebSocket/HTTP+TLS connections for inter-device messaging.

4. **Mesh Layer Module (optional)**\
   Uses LoRa, Bluetooth, or Reticulum stack for mesh communications.

5. **Bridge Adapters**\
   For interfacing with MQTT, NATS, Matrix, IPFS PubSub, or custom protocols.

---

## III. Messaging Protocols

### Base Protocol: **KLP (Kind Link Protocol)**

All messages are wrapped in the KLP format, including:

```json
{
  "id": "uuid",
  "sender": "agent_id",
  "recipient": "agent_id|broadcast|role:<role>",
  "timestamp": "ISO8601",
  "payload": { ... },
  "signature": "ed25519:...",
  "ttl": 600,
  "topic": "<optional-pubsub-topic>"
}
```

### Supported Message Types

- `event.emit`
- `event.subscribe`
- `query.request`
- `query.response`
- `command.execute`
- `state.sync`
- `heartbeat`
- `announcement`

---

## IV. Transport Implementations

### A. Local (Same Device)

- **Backend:** `nanobus`, `eventemitter3`, `RxJS Subject`
- **Latency:** Sub-millisecond
- **Use Cases:** UI ↔️ backend agent, memory sync, local logging

### B. Networked

- **Backend:** WebSocket, FastAPI WebSocket, socket.io
- **Security:** TLS, auth token + signature
- **Discovery:** mDNS, static config, KLP registry
- **Use Cases:** Multi-device sync, family mesh, LAN cluster

### C. Mesh

- **Backend Options:**
  - **Reticulum over LoRa / Serial / Bluetooth**
  - **Meshcast (UDP broadcast + gossip)**
  - **BLE L2CAP channels**
- **Use Cases:** Off-grid, disaster-resilient, privacy-first comms

---

## V. Subscription & Routing Logic

Agents may register listeners for topics, roles, or specific agent IDs:

```yaml
subscriptions:
  - topic: "sensor.*"
  - role: "security"
  - id: "agent:9e2c"
```

Routing decisions are handled via:

- **Local Match Engine** (for local messages)
- **Router Agent** (for inter-device delivery)
- **Fallback TTL Expiry** if undeliverable

---

## VI. Security Model

### Signature Scheme

- **Algorithm:** Ed25519 or X25519+AES-GCM
- **Nonce:** Random per-message nonce
- **Validation:** Each recipient verifies sender signature

### Trusted Devices

- Maintain a list of known public keys and trust levels
- Optionally require handshake + shared secret derivation

### Replay Protection

- Use message `id` + `nonce` tracking
- Sliding window cache for freshness

---

## VII. Agent Discovery

- **Local:** Broadcast beacon packets over loopback or UDP
- **LAN:** mDNS / DNS-SD or `kai-discovery` service
- **Mesh:** Reticulum announce, decentralized identity exchange
- **Remote:** DHT, IPFS pubsub, matrix federation room

---

## VIII. Diagnostic Tools

- `acb-monitor`: CLI or UI to view live message flow
- `acb-log-dump`: Print/store last N messages
- `acb-health`: Check delivery latency, dropped messages, error codes

---

## IX. Config File Example

```yaml
acb:
  enabled: true
  transports:
    - local
    - websocket
    - mesh-reticulum
  mesh:
    reticulum_iface: ttyUSB0
  network:
    host: 0.0.0.0
    port: 8593
    tls: true
  auth:
    token: abc123xyz
    verify_signature: true
```

---

## X. Future Extensions

- Message batching with compression
- Content-addressed messages with IPFS
- Routing over libp2p or Scuttlebutt
- Real-time visual mesh mapping
- AI-powered QoS tuning for degraded links

---

### Changelog

– 2025-06-21 • Initial ACB documentation


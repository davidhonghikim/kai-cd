# 03: Core Architecture and Internal System Design

This document defines the complete architectural and system-level design of the Kind AI (kAI) and kindOS (kOS) platforms. It includes every subsystem, communication pathway, integration bridge, and foundational rule for modularity, extensibility, and maintainability.

---

## I. System Overview

**kAI** is the personal node: browser-based or native app. It handles user interaction, private data, agent logic, and tool access.

**kOS** is the distributed coordination and interoperability layer: protocols, governance, federation, mesh routing, cryptographic identity, and multi-agent collaboration.

Together, they enable:

- Autonomous + assisted action
- Private-by-default AI
- Interoperable service orchestration
- Cross-agent communication and discovery

---

## II. Component Layering

### A. Layer 0 – Identity & Crypto Foundation (shared by kAI and kOS)

- **Key Types**:
  - Ed25519 (default identity key)
  - RSA 4096 (optional legacy integration)
- **Signature System**:
  - All critical operations signed (config edits, agent outputs, etc.)
  - Stored in audit log and optionally mirrored to kOS
- **Encryption/Storage**:
  - AES-256 GCM vault encryption (locally)
  - Public-key exchange for remote peer sync

### B. Layer 1 – System Runtime

| Component                | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `kAI Runtime`            | JS-based orchestration layer inside browser or Electron container                      |
| `Agent Execution Engine` | Python FastAPI + Celery worker runtime for processing, planning, and LLM orchestration |
| `kOS Daemon`             | Long-lived background service for protocol sync, registry lookup, governance ops       |
| `Event Bus`              | Internal and external events via Redis pub/sub or socket.io                            |
| `Vault & Config Core`    | Access layer for encrypted credentials, prompt templates, system configs               |

---

## III. Internal Subsystems – kAI

### A. Agent Layer

| Subcomponent     | Function                                                                          |
| ---------------- | --------------------------------------------------------------------------------- |
| `Agent Registry` | Active agents with roles, states, goals                                           |
| `Planner`        | Long-term task decomposition                                                      |
| `Worker`         | Executes local or remote actions                                                  |
| `Memory`         | Encrypted local + vector + graph memory                                           |
| `Plugins`        | JS-based middleware or tool access (e.g. web scraping, API calls, custom actions) |

### B. UI Layer

| Component          | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `Chat Interface`   | Unified chat window, thread-based with tool responses     |
| `Side Panels`      | Embedded file viewer, prompt editor, agent monitor        |
| `Settings Manager` | Vault unlock, preferences, theme, shortcuts               |
| `Prompt Studio`    | Dynamic prompt editor with test + save + share capability |

### C. Persistence Layer

| Layer          | Implementation                                                   |
| -------------- | ---------------------------------------------------------------- |
| Config Store   | JSON flat files with schema validation (Zod)                     |
| Vault Store    | AES-256 encrypted vaults in browser IndexedDB or localStorage    |
| Artifact Store | Filesystem + IndexedDB for previews                              |
| Prompt Library | YAML or JSON prompt templates with tags, ratings, and usage logs |

---

## IV. Internal Subsystems – kOS

### A. Protocol Stack

| Protocol                   | Function                                                                    |
| -------------------------- | --------------------------------------------------------------------------- |
| `KLP (Kind Link Protocol)` | Agent-to-agent and system interop protocol                                  |
| `Proof Mesh`               | zkProof-based verification for identity, consent, and provenance            |
| `Service Contract Layer`   | YAML or JSON schema for dynamic services, verification, and fallback routes |
| `Mesh Routing Protocol`    | Multi-hop P2P routing with fallback to relays                               |

### B. kOS Services

| Component            | Description                                       |
| -------------------- | ------------------------------------------------- |
| `Directory Service`  | List of known agents, services, and nodes         |
| `Reputation Service` | Scores based on uptime, audits, contributions     |
| `Governance Engine`  | Voting, arbitration, policy updates               |
| `Contract Validator` | Confirms valid service definitions or KLP intents |
| `Bridge Services`    | Integration with legacy systems or web2 APIs      |

---

## V. Communication Pathways

### A. Local (within kAI)

- Agent → Worker: via internal function calls or Celery queue
- UI → Engine: via event bus or shared state
- Plugins → Host FS/API: via JS sandbox bridge

### B. Remote (between agents/kOS)

- WebSocket or WebRTC (peer)
- HTTP/gRPC (service layer)
- Relay/bridge for NAT traversal

---

## VI. Full Directory Structure (Partial Example)

```
kAI/
├── core/
│   ├── agent/
│   │   ├── planner.ts
│   │   ├── registry.ts
│   │   └── worker.ts
│   ├── memory/
│   │   ├── index.ts
│   │   ├── vector.ts
│   │   └── graph.ts
│   ├── plugins/
│   │   ├── browser-tools.js
│   │   └── api-bridge.js
│   └── vault/
│       ├── secureStore.ts
│       └── crypto.ts
├── ui/
│   ├── chat/
│   ├── sidebar/
│   ├── settings/
│   └── prompt-studio/
├── services/
│   ├── llm/
│   ├── image/
│   └── web/
└── config/
    ├── prompts.json
    ├── themes.json
    └── vault.schema.json

kOS/
├── daemon/
│   ├── main.go
│   ├── klp.go
│   └── zkmesh.go
├── registry/
│   ├── directory.json
│   └── reputation.json
├── contracts/
│   ├── validator.ts
│   └── schemas/
│       └── service.schema.yaml
├── governance/
│   ├── voting.go
│   └── arbitration.go
└── bridges/
    ├── openai_bridge.ts
    ├── webhook_adapter.py
    └── legacy_api.json
```

---

Let me know when to proceed with the next document: **04: Agent Protocols and Role Hierarchy**.


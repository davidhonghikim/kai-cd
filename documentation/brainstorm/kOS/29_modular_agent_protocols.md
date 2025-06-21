# 27: Modular Agent Protocols and Inter-Agent Communication (kAI + kOS)

This document defines the inter-agent communication protocols, API contracts, and messaging fabric for Kind AI (kAI) agents operating within the kOS ecosystem. These protocols form the backbone for modular, interoperable, multi-agent workflows.

---

## I. Purpose

The Modular Agent Protocols (MAP) enable decentralized and extensible task routing between autonomous and semi-autonomous agents within a secure runtime. Agents must be able to:
- Request services from other agents
- Advertise capabilities
- Return structured responses
- Chain across workflows
- Maintain isolation and version compatibility

---

## II. Directory Structure

```text
src/
└── protocols/
    ├── map/                            # Modular Agent Protocols
    │   ├── index.ts                    # Protocol dispatcher and handler router
    │   ├── definitions/
    │   │   ├── handshake.ts           # Capability handshake schema
    │   │   ├── message.ts             # Standard message format definition
    │   │   └── contract.ts            # Contract negotiation schemas
    │   ├── services/
    │   │   ├── AgentServiceBus.ts     # Central agent routing service
    │   │   ├── AgentHandshake.ts      # Trust and capability exchange
    │   │   └── ContractBroker.ts      # Task-based protocol contract resolution
    │   └── utils/
    │       ├── SignatureUtils.ts      # Authenticated signature wrapper
    │       └── ProtocolValidator.ts   # Validates message structure and schema
```

---

## III. Message Format (MAPv1)

### A. Message Envelope
```ts
interface MAPMessage {
  id: string;                       // Unique UUID
  from: string;                    // Agent ID
  to: string;                      // Target agent or group
  type: 'request' | 'response' | 'event';
  timestamp: string;              // ISO8601 timestamp
  contractId?: string;            // Optional session/contract
  payload: any;                   // Actual task or response
  signature?: string;             // Optional Ed25519 signature
}
```

### B. Capability Advertisements
```ts
interface AgentCapabilityProfile {
  agentId: string;
  version: string;
  methods: string[];              // e.g., ['translate', 'summarize', 'diagnose']
  persona: string;                // e.g., 'medic', 'teacher', 'guardian'
  topics: string[];               // Used for event subscription
}
```

---

## IV. Agent Service Bus

`AgentServiceBus.ts` routes messages:
- Point-to-point (request/response)
- Topic-based pub/sub
- Contractual chaining with fallback routing

Features:
- Local memory bus for browser
- Redis- or MQTT-backed distributed pub/sub for cloud/kOS
- Filtering and throttling per policy

---

## V. Capability Handshake

When a new agent is activated:
1. Sends a `hello` handshake with capabilities
2. Host verifies compatibility, integrity
3. Host replies with available services and sandbox restrictions

Example handshake:
```ts
{
  from: 'calendarAgent',
  type: 'handshake',
  payload: {
    version: '1.0.0',
    methods: ['scheduleEvent', 'cancelEvent'],
    persona: 'assistant',
    topics: ['calendar.*']
  }
}
```

---

## VI. Contract-Based Routing

Agents can negotiate a session contract:
```ts
interface TaskContract {
  contractId: string;
  initiator: string;
  steps: string[];                  // ['search', 'summarize', 'write']
  participants: string[];          // ['searchAgent', 'summaryAgent']
  ttl: number;                      // Time to live in ms
  resultType: 'text' | 'json' | 'file';
  fallbackAgent?: string;
}
```
- Broker distributes contract
- Each step routed to respective agent
- Aggregated or final output returned to initiator

---

## VII. Event Bus + Pub/Sub

Supports:
- Topic subscriptions: `weather.*`, `calendar.meeting.*`
- Event emission: `event/{agent}/{topic}`

### Configurable Transports:
- Local IndexedDB Event Bus (standalone)
- SharedWorker/EventEmitter (embedded)
- Redis Pub/Sub (clustered)
- MQTT (IoT integration)

---

## VIII. Security & Identity

- Each message may include a cryptographic signature (`SignatureUtils`)
- Agent identity registered at load (agent registry)
- All contracts hashed and timestamped for audit
- Message audit log in secure append-only store (kLog)

---

## IX. Example Message Exchange

```ts
// Step 1: Translate agent receives a task
{
  from: 'orchestrator',
  to: 'translateAgent',
  type: 'request',
  payload: {
    text: 'Bonjour le monde',
    fromLang: 'fr',
    toLang: 'en'
  }
}

// Step 2: Response
{
  from: 'translateAgent',
  to: 'orchestrator',
  type: 'response',
  payload: {
    translated: 'Hello world'
  }
}
```

---

## X. Future Enhancements

| Feature                           | Target Version |
|----------------------------------|----------------|
| Schema evolution framework       | v1.1           |
| Agent trust scoring              | v1.2           |
| Streaming payload support        | v1.3           |
| Agent federation protocol (KLP)  | v2.0           |


# 59: Multi-Agent Protocols and Autonomy Layers

This document outlines the protocol stack, autonomy layers, and coordination mechanisms used in the kAI/kOS ecosystem to support secure, modular, and scalable collaboration between agents of all types (assistants, workflows, utilities, sensors, etc.).

---

## I. Protocol Stack Overview

```text
Application Layer      ← Agent Personalities, Memory, UX
Coordination Layer     ← Task Planning, Delegation, Orchestration
Communication Layer    ← KLP, Streaming, Messaging
Identity & Trust Layer ← DIDs, Auth, Trust Graphs
Transport Layer        ← WebSocket, HTTP/2, gRPC, LoRa
```

---

## II. Autonomy Tiers

### Tier 0: Passive Utility
- Performs only direct commands
- No memory or persistent state

### Tier 1: Stateful Assistant
- Contextual memory and lightweight goals
- Basic initiative (e.g. reminders, follow-ups)

### Tier 2: Multi-Agent Orchestrator
- Delegates subtasks to others
- Tracks progress, retries failures

### Tier 3: Distributed Executive
- Strategic planning
- Inter-agent negotiation and capability discovery
- Governance participation

---

## III. Agent Roles

### A. Companion Agents
- Assigned to user
- Handle tasks, habits, and emotional state

### B. Specialist Agents
- Experts in domains: Finance, Health, Privacy, etc.
- Can be internal or federated from other nodes

### C. System Agents
- Manage memory, scheduling, logging, file storage, etc.
- Run at Tier 0 or 1

### D. Interface Agents
- Frontend connectors (browser extension, CLI, mobile)
- Convert natural input to structured KLP events

### E. Federated Agents
- External nodes in trusted mesh (via KLP)
- Need trust score to participate in workflows

---

## IV. Multi-Agent Communication

### A. Shared Ontology
- KLP message types
- Task/Resource schema
- State diff and capability standards

### B. Envelope Format
- All messages use `KLPEnvelope`
- Includes sender, receiver, timestamp, signature, content type

### C. Supported Message Types
- `task_request`
- `task_response`
- `capability_advertisement`
- `link_request`
- `state_update`
- `governance_ballot`

---

## V. Delegation Model

### A. Task Lifecycle
1. Create task
2. Advertise or discover capabilities
3. Assign task via `task_request`
4. Monitor updates (via `state_update`)
5. Complete, escalate, or retry

### B. Capability Matching
- Each agent has a declarative `capabilities.json`
- Published during handshake
- Can change over time (with governance or consent)

---

## VI. Federation & Interop

### A. Cross-Node Task Execution
- Requires signed mutual trust
- Rate-limited and scoped via policy

### B. Agent Syncing
- Shared memory can be federated (CRDT-style sync)
- Schedule alignment via decentralized calendar protocol

### C. Revocation
- Federated trust can be withdrawn at any time
- Propagated to all affected agents via `revocation_notice`

---

## VII. Governance Participation

- Every Tier 3+ agent can:
  - Propose workflows
  - Vote on access rights
  - Suggest architecture changes
- Ballots signed and submitted via `governance_ballot`

---

## VIII. Security Considerations

- All messages signed and optionally encrypted
- Delegation only valid if trust threshold met
- Logs kept locally and (optionally) mirrored to secure cloud vault

---

## IX. Sample Agent Directory

```json
[
  {
    "id": "did:kind:companion-joy",
    "tier": 2,
    "roles": ["companion"],
    "capabilities": ["reminders", "journaling", "daily_plan"],
    "lastSeen": "2025-06-20T15:22:01Z"
  },
  {
    "id": "did:kind:health-coach",
    "tier": 1,
    "roles": ["specialist"],
    "capabilities": ["nutrition", "sleep", "exercise"],
    "lastSeen": "2025-06-20T14:48:33Z"
  }
]
```

---

## X. Roadmap

| Feature                        | Version |
| ----------------------------- | ------- |
| Tiered Autonomy Runtime       | v1.0    |
| Federated Agent Discovery     | v1.2    |
| Governance Protocol           | v1.3    |
| Cross-Agent Shared Memory     | v1.4    |
| Autonomy Benchmark Framework  | v1.5    |


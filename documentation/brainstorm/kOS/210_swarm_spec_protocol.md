# 210: Agent Collaboration and Task Swarm Protocol (SwarmSpec)

## Purpose

The **SwarmSpec Protocol** is the standardized coordination mechanism for multi-agent collaboration within the kAI system. It defines how agents discover, broadcast, claim, coordinate, and complete complex tasks using decentralized principles.

SwarmSpec is used by:

- Autonomous multi-agent systems
- Federated deployments across devices or users
- Collaborative intelligence networks

---

## Core Concepts

### 1. **Task Swarm**

A dynamic group of agents coalescing around a common objective or ticket. Each swarm has a unique `swarm_id`, origin `issuer_id`, and metadata including `priority`, `deadline`, and `required_capabilities`.

```json
{
  "swarm_id": "swarm:node/1234XYZ",
  "origin": "user:kai_root",
  "type": "task:multi-llm-compare",
  "required_capabilities": ["llm.chat", "llm.metrics", "formatter.markdown"],
  "priority": "high",
  "expires_at": "2025-06-20T23:59:59Z"
}
```

### 2. **Agent Role Types**

Each agent participating in a swarm claims one or more role types:

- `initiator`: Creates the swarm
- `claimant`: Bids to perform one or more roles
- `executor`: Performs assigned roles
- `coordinator`: Handles dependencies, timing, and merging results
- `reviewer`: Audits or validates results

### 3. **Swarm Lifecycle**

1. **Create**: Initiator emits a SwarmSpec contract to the system.
2. **Discovery**: Agents receive and evaluate capability match.
3. **Claim**: Agents register intent to claim one or more roles.
4. **Negotiate**: Optional protocol for electing coordinators or resolving conflicts.
5. **Execute**: Agents perform assigned tasks.
6. **Merge**: Coordinator aggregates partial results.
7. **Validate**: Reviewer (automated or human) verifies outcomes.
8. **Complete**: Task state updated, outputs published or stored.

---

## SwarmSpec Contract Schema

```json
{
  "swarm_id": "string",
  "origin": "string",
  "task": {
    "summary": "string",
    "description": "string",
    "inputs": {},
    "dependencies": [],
    "expected_outputs": {}
  },
  "roles": {
    "initiator": "agent_id",
    "coordinator": ["agent_id"],
    "executor": ["agent_id"],
    "reviewer": ["agent_id"]
  },
  "capabilities_required": ["string"],
  "priority": "low|medium|high|critical",
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

---

## Communication Channels

### 1. **Broadcast Discovery Bus**

- Transport: Redis PubSub / NATS / WebSocket overlay
- All agents subscribe to a shared topic `swarm.discovery`
- Agents emit `swarm.advertise`, `swarm.claim`, and `swarm.ready` events

### 2. **Task Channel**

- Unique topic per swarm: `swarm.<swarm_id>`
- Encrypted if swarm is private or user-restricted
- Used for all runtime coordination messages

---

## Conflict Resolution

If multiple agents claim overlapping roles:

- Deterministic election based on:
  - CredScore (agent reputation/weight)
  - Task proximity
  - Load metrics
- Coordinator role must validate acceptance

Agents can voluntarily yield roles to higher priority agents.

---

## Protocol Extensions

- **SwarmTrust**: Credential and trust negotiation via DIDs and agent registry
- **SwarmAudit**: Enforced reviewer participation and tamper-proof log generation
- **SwarmCache**: Shareable partial outputs, cached across mesh
- **SwarmSim**: Simulation and benchmarking using synthetic swarms

---

## Implementation Status

| Component          | Status         | Notes                            |
| ------------------ | -------------- | -------------------------------- |
| Core SwarmSpec     | ✅ Implemented  | YAML + JSON parser + validator   |
| kAI Agent SDK      | 🟦 In Progress | Coordinator logic module         |
| Redis PubSub Layer | ✅ Working      | Encrypted channel support        |
| SwarmTrust         | ⬜ Not Started  | Will use `did:kai:<agent>` keys  |
| SwarmAudit         | ⬜ Not Started  | Verifiable logs via Merkle trees |

---

## Security Considerations

- Task signing using `agent.private_key`
- Swarm channel encryption (AES-256)
- Replay attack prevention via nonce and TTL

---

## Usage Example (CLI)

```bash
kai agent swarm create \
  --task summarize_docs \
  --inputs ./docs/*.md \
  --roles executor,coordinator \
  --priority high
```

---

## Related Docs

- `211_Agent_Reputation_and_CredScore.md`
- `212_Swarm_Audit_and_Tamper_Logs.md`
- `213_CLI_Commands_for_Swarm_Control.md`
- `106_Distributed_Agent_Messaging_Protocol.md`


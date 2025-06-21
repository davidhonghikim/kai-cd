# 190: Agent Interaction Rules and Inter-Agent Communication Protocols

This document outlines the interaction principles, communication architecture, and enforcement mechanisms for inter-agent collaboration within the `kAI` and `kOS` ecosystem. It ensures that all agents operate harmoniously, securely, and with verifiable accountability.

---

## I. Purpose and Scope

These rules define how agents:

- Communicate and negotiate tasks.
- Share knowledge and artifacts.
- Handle trust, permissions, and failures.
- Escalate or defer tasks.

---

## II. Agent Communication Layers

### 1. Direct API Messages (Agent ↔ Agent)

- **Protocol:** KLP (Kind Link Protocol)
- **Format:** Signed JSON messages over HTTPS/WebSocket
- **Encryption:** End-to-End (E2EE) with agent keys

### 2. Orchestrated Broadcasts

- **Used For:** Announcements, environment changes, data synchronization
- **Broker:** Redis Pub/Sub or NATS (configurable)
- **TTL Control:** Messages expire after configurable time (default: 30s)

### 3. Shared Memory (State Synchronization)

- **Backends:** Redis, Postgres JSONB, or CRDT documents (Automerge)
- **Access:** Role-based ACL

---

## III. Message Contract (KLP Base)

```json
{
  "id": "uuid-v4",
  "sender": "agent_id",
  "recipient": "agent_id | group_id",
  "type": "intent | status | result | error | signal",
  "intent": "analyze_code | generate_doc | escalate | ...",
  "priority": "low | normal | high | critical",
  "payload": { ... },
  "timestamp": "ISO 8601",
  "signature": "signed_by_sender_private_key"
}
```

### Message Verification Steps:

1. Check signature validity.
2. Confirm sender identity and permissions.
3. Validate message schema.
4. Log all received messages for audit.

---

## IV. Trust Levels and Roles

| Level | Description                    | Capabilities                               |
| ----- | ------------------------------ | ------------------------------------------ |
| 0     | Observer                       | Read-only logs and shared data             |
| 1     | Worker                         | Can perform tasks, read shared state       |
| 2     | Collaborator                   | Can modify shared artifacts, request help  |
| 3     | Coordinator                    | Can reassign tasks, override outputs       |
| 4     | Governor (root or human agent) | Full privileges, cross-agent config rights |

Trust levels are cryptographically enforced using keychains and KLP credentials.

---

## V. Interaction Rules

### 1. Task Claiming and Ownership

- Agents must explicitly claim a task.
- Claim is logged in the shared task ledger.
- Ownership expires after a timeout unless activity continues.

### 2. Help and Escalation

- `request_help` may be sent to peer or coordinator agents.
- `escalate` only allowed if task blocked or permissions insufficient.

### 3. Knowledge Sharing

- `broadcast_result`, `share_summary`, `export_artifact` permitted by collaborators and above.
- Shared knowledge must be timestamped and traceable.

### 4. Artifact Conflict Resolution

- In case of write conflict:
  - Auto-merge if non-destructive (via CRDT or patch sets).
  - Coordinator arbitration if merge fails.

### 5. Task Feedback and Review

- Each completed task must include:
  - Success/failure flag
  - Notes and reasons
  - Optional reviewer ID

---

## VI. Failure Protocols

### 1. Retry Logic

- Each agent must retry failed ops up to `n` times with exponential backoff.

### 2. Crash Recovery

- All in-flight work is checkpointed every 5 seconds (or configurable).
- Tasks with lost owners revert to unclaimed state after timeout.

### 3. Watchdog Alerts

- Agents emit `heartbeat` messages every 10s.
- Orchestrator monitors agent health; notifies Governor on dropout.

---

## VII. Audit and Compliance

### Logging

- Every interaction is logged and signed.
- Logs are stored in immutable, append-only log (e.g., WORM S3 or IPFS).

### Verifiable State

- All shared state changes must be:
  - Signed by the modifying agent
  - Referenced by task ID and timestamp
  - Reversible (or rollback available)

### Reconciliation

- Weekly automated audits scan for:
  - Unreviewed escalations
  - Orphaned tasks
  - Conflicting artifacts

---

## VIII. Implementation Modules

- `klp-agent-client` (Python)
- `klp-core-protocol` (shared JSON schema + signing)
- `klp-ledger-sync` (Redis/Postgres driver)
- `klp-orchestrator` (for broadcast routing, watchdog, trust manager)

---

## IX. Appendix

### Future Proposals

- Multi-agent zero-knowledge trust negotiation
- Human-in-the-loop arbitration protocol
- Embedded simulation environment for dry-runs

---

### Changelog

– 2025-06-21 • Initial draft (AI agent)


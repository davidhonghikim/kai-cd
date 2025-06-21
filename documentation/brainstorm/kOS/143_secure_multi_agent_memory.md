# 143: Secure Multi-Agent Memory Management (SMAMM)

This document defines the architecture, protocols, and implementation specifications for SMAMM – the Secure Multi-Agent Memory Management system – in both `kAI` and `kOS` environments. It ensures agents can securely access, modify, and reason about persistent or ephemeral memory while respecting privacy boundaries, access control, context scopes, and federated memory architectures.

---

## I. Purpose

SMAMM allows:

- Intelligent agents to maintain short- and long-term memory
- Secure memory access control per agent, user, task, or org
- Ephemeral context management during session lifecycles
- Federated or local memory segregation and routing
- Cross-agent memory sharing with consent and encryption

---

## II. Memory Types

### A. Short-Term Memory (STM)

- Context windows, recent messages, inferences
- Ephemeral, discarded on task/session completion
- Stored in volatile memory (e.g., Redis)

### B. Long-Term Memory (LTM)

- Facts, knowledge, user preferences, project state
- Encrypted, stored with journaling and expiration
- Stored in Vector DBs (e.g., Qdrant) or SQL stores

### C. Shared Memory

- Selective read/write access across agents
- Consent-flagged or sandbox-isolated
- Stored in federated object graphs or KLP-syncable bundles

### D. Memory Snapshots

- Versioned memory state exports
- Used for auditing, debugging, migration
- Stored in tamper-resistant archives

---

## III. Memory Access Protocol

### A. Access Permissions Schema

```yaml
permissions:
  read: [agent_id_1, agent_id_2]
  write: [agent_id_1]
  delete: []
  scope: "user|system|global"
  audit_log: true
  ttl: 604800  # 7 days in seconds
```

### B. Memory Operations

- `memory.read(key: string, scope: enum)`
- `memory.write(key: string, value: any, meta: permissions)`
- `memory.delete(key: string)`
- `memory.snapshot(agent_id: string)`
- `memory.sync()`

### C. Encryption Layers

- Per-user salt & agent key encryption (AES-256-GCM)
- Optional HSM-backed (Vault, KMS) memory vaults

---

## IV. Federated Memory Graph

A federated memory graph allows agents to:

- Traverse relationships between concepts and entities
- Link distributed knowledge stores
- Respect isolation (via tagged boundaries and KLP signatures)

### Graph Node Format

```json
{
  "id": "memory-node-uuid",
  "type": "fact|event|note|task|link",
  "tags": ["user:123", "agent:planning", "context:project-x"],
  "timestamp": 1720018273,
  "encrypted": true,
  "data": {
    "key": "project_due_date",
    "value": "2025-07-01"
  }
}
```

---

## V. Memory Vault Architecture

### A. Components

- `MemoryBroker` — dispatches and verifies memory access requests
- `VaultAdapter` — backend-agnostic plugin layer (Redis, SQL, VectorDB)
- `AccessGuard` — enforces access rights and audit logs
- `SnapshotService` — generates full or partial memory exports
- `MemoryRouter` — context-based memory routing and deduplication

### B. Context Binding

```json
{
  "context_id": "session-124",
  "bindings": ["agent:refiner", "project:kai-cd", "user:456"],
  "expires_at": 1720453890
}
```

---

## VI. Use Cases

1. **Personal Assistant Memory:**

   - STM: Active reminders, open tasks
   - LTM: Preferences, notes, habits

2. **Agent Collaboration:**

   - Shared STM scoped to project
   - Append-only LTM with tagging

3. **Memory Replays / Debugging:**

   - Snapshot restore & diff
   - Visual memory graph traversal

4. **Federated Learning:**

   - Pattern mining on anonymized, encrypted shared LTM
   - Consent-tracked contributions

---

## VII. Security & Privacy

- All memory transactions signed (agent ID + timestamp)
- Selective field-level encryption with user key
- Zero-trust access validation via JWT claims
- Optional sandboxed memory partitions for untrusted agents
- Consent UI hooks for memory sharing requests

---

## VIII. kOS Integration

- Exposed via `memory://` protocol layer
- Tied to `kVault`, `kGraph`, and `kAudit`
- Trusted memory graph nodes exported as KLP objects
- System-wide memory policies defined in `00_SystemConfig`

---

### Changelog

- 2025-06-21: Initial SMAMM memory specification

---

Next doc: `144: Agent Ephemeral Context and Session Flow Control`


# 202: Agent Memory Specification and Management

## Overview

This document defines how agent memory functions across all kAI components, specifying persistent, contextual, and ephemeral memory layers. It includes data structures, access protocols, and best practices for memory hygiene and optimization.

---

## 🧠 Memory Types

### 1. Persistent Memory (PMEM)

- **Purpose:** Long-term memory storage.
- **Examples:** User preferences, past decisions, profiles, knowledge uploads.
- **Storage:** Filesystem (e.g., JSON, SQLite), PostgreSQL, Encrypted Vaults.
- **Access Layer:** Secure API or local data layer abstraction.
- **Update Triggers:** Explicit user action or significant state changes.

### 2. Contextual Memory (CMEM)

- **Purpose:** Task-specific, scoped to sessions, windows, tabs, or workflows.
- **Examples:** Multi-turn conversation history, session-based variables.
- **Storage:** Redis, localStorage, or in-memory objects (serialized).
- **Update Triggers:** Every agent interaction or step completion.
- **Expiry:** Configurable TTL (default: 1 hour or manual end).

### 3. Ephemeral Memory (EMEM)

- **Purpose:** Working memory for reasoning and chain-of-thought.
- **Examples:** Temporary variables, in-process values, sub-agent state.
- **Storage:** RAM only, not persisted.
- **Update Triggers:** Runtime computation.
- **Expiry:** Auto-cleared at session/agent scope end.

---

## 🧩 Memory Schema

```json
{
  "agent_id": "kai.vault.ops",
  "user_id": "user-98273",
  "pmem": {
    "name": "KaiBot",
    "trained_on": ["user_manual.pdf", "onboarding_video.mp4"],
    "last_updated": "2025-06-20"
  },
  "cmem": {
    "session_id": "s-4492a",
    "conversation": [
      {"user": "hello", "kai": "hi! how can I help?"},
      {"user": "summarize this"}
    ]
  },
  "emem": {
    "_tmp_goal": "summarize doc x by 9pm",
    "_scratchpad": "parsing section 2 first"
  }
}
```

---

## 🔐 Security & Access Control

- **PMEM** must be encrypted at rest.
- **CMEM** can be local or encrypted cache (AES-256 optional).
- **EMEM** should not be stored post-session.
- **Access Protocols:**
  - Role-based permissions
  - Vault key derivation for persistent data
  - Configurable scopes per agent

---

## 🔄 Sync and Replication

| Layer | Replication Scope | Sync Method    | Backup Policy      |
| ----- | ----------------- | -------------- | ------------------ |
| PMEM  | Device + Cloud    | Manual or cron | Weekly + on change |
| CMEM  | Session Only      | Auto in memory | Optional export    |
| EMEM  | None              | N/A            | None               |

---

## 🚧 Best Practices

1. **Memory Boundaries:** Do not leak EMEM into PMEM without explicit rules.
2. **CMEM Sanitization:** Periodically clear invalidated or expired sessions.
3. **Encryption:** Always encrypt persistent storage; never trust the client device.
4. **Schema Evolution:** Use versioned memory structures to support upgrades.
5. **Auditing:** Enable read/write logs for PMEM for compliance agents.

---

## 📘 Example Use Case: Vault Agent

- Stores user secrets (PMEM)
- Uses session context to track what secrets were accessed (CMEM)
- Tracks temporary decryption state (EMEM)

---

## 🧪 Test Plan

-

---

## 🧭 Future Considerations

- Multi-device memory synchronization
- Privacy-preserving memory agents (federated updates)
- Memory indexing for search & summarization

---

### Changelog

- 2025-06-21: Initial draft (AI agent)


# 203: Agent State Management and Recovery Protocols

This document defines the comprehensive protocols and mechanisms for preserving, restoring, and validating the state of all agents within the kAI and kOS systems. Robust agent state management ensures resilience, fault-tolerance, auditability, and user trust.

---

## I. Objectives

- 🧠 Persist agent memory and state across sessions
- 🛡️ Ensure state integrity and tamper resistance
- 🔄 Allow seamless recovery from interruptions or crashes
- 🧪 Provide full observability and rollback support
- 🧰 Support modular plug-and-play state stores

---

## II. State Composition

Each agent state is composed of the following components:

- `context_window`: Immediate working memory
- `episodic_memory`: Conversational and experiential history
- `task_stack`: Current tasks and sub-tasks with context
- `execution_trace`: Logs of decisions, commands, and results
- `emotion_state`: Optional scalar for adaptive agents
- `goals`: Short- and long-term user-defined or self-generated objectives
- `config_snapshot`: Agent runtime and environmental settings
- `capabilities`: Active and available tools or plugins
- `last_checkpoint`: Last successful persist/restore event hash

---

## III. State Storage Backends

The system supports multiple backends via the State Adapter Interface:

- 🔘 `MemoryStore` – In-memory volatile state (testing only)
- 💾 `FileStore` – JSON or binary blobs on disk (local-first systems)
- 🧠 `VectorStore` – Qdrant, Chroma, Weaviate for embedding-based retrieval
- 🗃️ `DatabaseStore` – PostgreSQL via SQLAlchemy ORM
- 🔐 `EncryptedVaultStore` – Encrypted blobs via kAI Secure Vault
- ☁️ `CloudSyncStore` – Remote S3/GCS sync with versioning support

All backends must implement:
```python
class AgentStateAdapter:
    def load(agent_id: str) -> AgentState: ...
    def save(agent_id: str, state: AgentState) -> None: ...
    def checkpoint(agent_id: str) -> str: ...
    def diff(agent_id: str, previous_hash: str) -> Dict[str, Any]: ...
```

---

## IV. Recovery Protocol

### A. On Agent Boot
1. Attempt load from `EncryptedVaultStore`
2. If fail, fallback to latest `FileStore` snapshot
3. If invalid, attempt `CloudSyncStore` sync
4. If all fail, initialize with empty defaults (warn)

### B. On State Corruption
- Trigger automatic quarantine of corrupted store
- Alert user and log full trace
- Use previous known-good `last_checkpoint`
- Provide `restore --from=<timestamp|hash>` option

### C. On User Request
```bash
kai agent restore <agent_id> --from=2024-07-01T10:00:00Z
```

---

## V. Checkpointing Strategy

- ✅ Every significant state-altering operation triggers a checkpoint
- 🔁 Periodic autosave (default every 60s)
- 🔒 Each checkpoint includes a SHA-256 content hash and digital signature
- 🧾 Snapshots stored in append-only ledger format for forensic audit

---

## VI. System Config

Stored in `config/agents/<agent_id>/state.yaml`:
```yaml
state_backend: vault
autosave_interval: 60
allow_restore_ui: true
log_execution_trace: true
audit_checkpoint_hashes: true
diff_strategy: semantic
```

---

## VII. Integration with kAI MCP (KLP)

- ⛓️ Agent state schemas comply with kAI Link Protocol (KLP)
- 🧭 Each state change event broadcast to central orchestrator (optional)
- 🔁 State synched to cluster peers using Gossip or Raft consensus in distributed mode
- 🔐 Signed state transitions for cross-node verification

---

## VIII. Developer Hooks

Agents can hook into state lifecycle:
```python
@on_state_save
async def enrich_checkpoint(agent, state):
    state['metadata']['save_trigger'] = 'api_call'

@on_state_restore
def audit_diff(agent, restored_state):
    log_diff(agent.current_state, restored_state)
```

---

## IX. Security Considerations

- 🔑 State encryption with AES-256-GCM
- 🧮 HMAC-SHA256 for tamper detection
- 📜 Signed checkpoints for audit trail (Ed25519)
- 🔐 Zero knowledge storage for private data fragments
- 🧯 Auto-lock state on inactivity, memory overflow, or vault trigger

---

## X. Observability & Diagnostics

- 🔍 Diff viewer for any two checkpoints
- 🧪 Restore simulation tool with sandbox
- 📈 Grafana dashboard for state I/O, corruption rate, load/save time
- 🔄 Replay tool to simulate agent behavior from historical state

---

### Changelog
– 2025-06-20 • Initial draft (AI agent)


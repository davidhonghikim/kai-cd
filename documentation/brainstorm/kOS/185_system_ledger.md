# 185: System Ledger – Immutable Event Audit & Agent Provenance

## Overview

The System Ledger is the central, immutable, append-only record of all major operations, events, and agent activities across kAI and kOS systems. It ensures accountability, traceability, and compliance by capturing every significant action in a cryptographically signed, timestamped format.

> **Key Functions:**
>
> - Immutable event recording
> - Agent provenance tracking
> - Forensic and compliance audits
> - Queryable timeline of system-wide events

---

## Ledger Architecture

### 1. **Storage Backend**

- **Default:** PostgreSQL + immutability enforced via triggers
- **Advanced (Optional):**
  - BigchainDB (for cryptographic immutability)
  - Hyperledger Fabric
  - Custom IPFS + Merkle DAGs (for decentralized deployments)

### 2. **Schema Design** (`ledger_events` table)

```sql
CREATE TABLE ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent_id TEXT NOT NULL,
  agent_type TEXT, -- e.g. human, autonomous, supervised
  event_type TEXT NOT NULL, -- e.g. config_change, file_access, model_invocation
  event_scope TEXT, -- e.g. kAI.module, kOS.service
  subject_id TEXT, -- the ID of the affected object
  description TEXT,
  data JSONB, -- full payload snapshot
  signature TEXT -- optional: cryptographic signature of entry
);
```

---

## Core Features

### 1. **Event Types**

| Type               | Description                            |
| ------------------ | -------------------------------------- |
| `config_change`    | Any modification to user/system config |
| `model_invocation` | Use of LLM or media generation         |
| `data_upload`      | Files/documents added to the system    |
| `access_granted`   | Agent/service access authorization     |
| `permission_used`  | Use of a permission token              |
| `credential_used`  | Key, secret, or token invocation       |
| `error_logged`     | Internal system error or warning       |
| `task_run`         | Workflow or job executed               |

### 2. **Event Ingestion Pipeline**

- **Emit Events:** From all microservices, APIs, and agents via async `eventbus.emit()`
- **Validate:** Schema, timestamps, agent identity
- **Sign:** Optional HMAC or asymmetric key signature
- **Write:** Append to ledger DB

### 3. **Cryptographic Signing**

- HMAC-SHA256 (per-agent secret)
- Ed25519 signatures (optional agent keys)
- Verifiable by any node/user with proper key

---

## Use Cases

### A. **Agent Provenance**

Track which agent made a change, which model it used, and what permissions were granted at the time.

### B. **Security Auditing**

Trace data access, credential usage, or suspicious behavior.

### C. **Time Travel Debugging**

Replay sequence of steps leading to a state or error.

### D. **Compliance Logs**

Ensure GDPR/CCPA auditability, especially in enterprise use.

---

## Integration Points

- **kAI Kernel**: Logs all prompt requests, completions, agent decisions.
- **kOS Services**: Every config/app install or external call emits to ledger.
- **Orchestration (MCP/KLP)**: Logs task chains, dependencies, and runtime metadata.
- **Permission Token Manager**: Each token invocation is logged with purpose.
- **Security Layer**: Failed logins, auth attempts, and key usage tracked.

---

## Access & Querying

### Read Interfaces

- **REST API** `/api/ledger?event_type=...&agent_id=...`
- **CLI Tool** `kai ledger list --type=model_invocation`
- **Web Dashboard**: Visual timeline, filters, export

### Export Formats

- JSON, CSV, PDF Audit Bundle
- Digital signature verification export (`kai ledger verify`)

### Permissions

- Viewable by root, system auditor agents, and user-owner of actions
- Redacted views available for lower-privileged agents

---

## Future Enhancements

- **WORM Storage Compliance Mode**
- **Signed Chain of Events**: Merkle tree structure for chain verification
- **Federated Ledger Mirrors** for multi-node consistency
- **Real-Time Notification Subsystem** on sensitive events

---

## Example Entry (Redacted JSON)

```json
{
  "timestamp": "2025-06-20T21:45:01Z",
  "agent_id": "kAI.core.scheduler",
  "event_type": "task_run",
  "subject_id": "job-8472",
  "description": "Triggered daily backup job",
  "data": {
    "task_name": "BackupOrchestrator",
    "duration_ms": 3742,
    "status": "success"
  }
}
```

---

### Changelog

- 2025-06-21: Initial full draft (AI agent)


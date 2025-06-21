# 207: Agent Token System and Resource Metering Protocols

This document defines the design and implementation specifications for the **Agent Token System (ATS)** and associated **Resource Metering Protocols (RMP)** used across kAI and kOS to govern and regulate agent usage, quota, economy, and behavior tracking.

---

## I. Purpose

To ensure fair and transparent allocation of computational and data resources in the multi-agent environment. ATS enables:

- Measured and auditable use of resources
- Reputation and trust scoring
- Permission gating and service throttling
- Incentivization for good agent behavior and optimization

---

## II. Token Models

### A. **Action Tokens (ACT)**

- Issued for each API call, operation, task dispatch, or inference request.
- Each ACT includes:
  - Timestamp
  - Agent ID
  - Operation name/type
  - Cost weight (e.g., `1.0` for simple, `3.2` for heavy)
  - Result hash (optional)

### B. **Data Tokens (DAT)**

- Track storage, I/O, streaming bandwidth, and file interactions.
- Include:
  - Source/destination hash
  - Bytes read/written
  - Duration

### C. **Compute Tokens (CPT)**

- Meter CPU/GPU cycles, parallel jobs, and memory usage.
- Include:
  - System node ID
  - Time slices used
  - Peak memory footprint

### D. **Trust Tokens (TRT)**

- Reputation-related tokens issued based on evaluation metrics.
- Represent accuracy, compliance, user feedback, and code reliability.
- Accumulate or decay over time.

---

## III. Token Ledger

### A. Distributed Ledger Structure

- Append-only log of token events
- Each token is a structured event record
- Stored in:
  - Local agent memory (short-term cache)
  - Secure distributed ledger (for integrity & audit)

### B. Ledger Backends

- Default: **LiteFS** with SQLite overlay
- Optional: **PostgreSQL + pgcrypto**
- Blockchain-compatible mode: **IPFS + Filecoin**

### C. Ledger Access

- Read: Authenticated agent query (`GET /ledger/:agent_id`)
- Write: Signed events only, verified via agent key
- View Filters:
  - Date range
  - Token type
  - Consumed resource type

---

## IV. Token Economy

### A. Token Budgeting

- Agents have token allowances per task, session, or lifecycle phase
- Defined in agent manifest (`agent.toml` or `manifest.yaml`):

```toml
[resources]
max_action_tokens = 5000
max_data_tokens = 2_000_000  # bytes
max_compute_tokens = 500  # time slices
```

### B. Overages and Rationing

- Excess use triggers soft throttling, warning messages
- Critical overage = task suspension
- Emergency reserve budget possible per agent class

### C. Incentives and Rewards

- High-efficiency tasks generate bonus TRT tokens
- Peer-reviewed solutions may yield rewards
- Stable performance = eligibility for elevated permissions

---

## V. Protocol Interfaces

### A. REST API (Internal Use)

- `POST /token/issue` — Record new token event
- `GET /token/usage/:agent_id` — Retrieve usage history
- `GET /token/balance/:agent_id` — Query current budget state

### B. gRPC API (Cluster Level)

- `LogToken(TokenEvent) returns Ack`
- `StreamTokenSummary(agent_id)`

### C. CLI Tool (Developer Debugging)

```bash
kai-token status --agent agent:generate-docs
kai-token dump --format json --days 3
```

### D. Token Stream Format

```json
{
  "agent_id": "agent:qa-tester",
  "token_type": "ACT",
  "operation": "run_test_suite",
  "timestamp": "2025-06-20T17:42:00Z",
  "cost_weight": 1.6
}
```

---

## VI. System Security & Validation

- Token issuance requires signed requests (Ed25519 by default)
- Token logs validated via Merkle Tree hash chaining
- Periodic audit services verify:
  - Token counts vs. actual resource usage
  - Anomalies and spike patterns

---

## VII. Integration

### A. With Scheduler/Orchestrator

- Scheduler checks token budget before dispatching task
- Orchestrator can pre-allocate tokens per agent run

### B. With Trust System

- TRT tokens feed into trust computation engine
- Poor behavior (spam, crash, excess usage) reduces trust

### C. With Prompt Manager

- Prompt requests are tied to ACT tokens
- Logs which prompts cost the most and their frequency

---

## VIII. Future Expansion

- Token market for trade/exchange between agents
- Visual dashboards for real-time metering
- Blockchain sync mode for public accountability
- ML prediction of token usage for autoscaling

---

## IX. Related Documents

- `208_Trust_Scoring_Engine.md`
- `112_Agent_Scheduler.md`
- `092_Agent_Manifest_Spec.md`
- `140_kOS_Security_Audit_Ledger.md`

---

### Changelog

– 2025-06-20 • Initial full draft (AI agent)


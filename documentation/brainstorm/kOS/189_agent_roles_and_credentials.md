# 189: Agent Roles And Credentials

This document defines the roles, credentials, lifecycle permissions, and trust framework for agents operating within the kOS/kAI ecosystem.

---

## I. Agent Role System

Agents in kAI operate with clearly defined roles and access scopes. Each role determines what actions an agent may perform across services.

### A. Standard Roles

| Role           | Description                                                 | Default Trust | Scope                                   |
| -------------- | ----------------------------------------------------------- | ------------- | --------------------------------------- |
| `observer`     | Read-only access to logs, metrics, and public endpoints     | Low           | Local only                              |
| `worker`       | Performs delegated tasks with constrained resources         | Medium        | Local or delegated grid                 |
| `service`      | Hosts or exposes APIs or tools to other agents or users     | Medium        | Local + public APIs                     |
| `orchestrator` | Coordinates workflows or agent swarms                       | High          | Local + distributed mesh                |
| `guardian`     | Performs sensitive operations, policy enforcement, auditing | Very High     | All trusted zones                       |
| `root`         | Full system privileges (emergency only)                     | Critical      | All zones (requires multi-party unlock) |

### B. Optional Sub-Roles

- `agent.ui` – permitted to render and modify user-facing UIs.
- `agent.audit` – granted access to immutable logs and compliance metadata.
- `agent.configurator` – can alter other agents’ parameters and load new ones.

---

## II. Trust Tiers

Trust is computed dynamically using behavior score, endorsements, cryptographic identity, and reputation.

### A. Tiers

| Tier          | Required Score | Description                               |
| ------------- | -------------- | ----------------------------------------- |
| `unverified`  | 0–49           | No trusted operations allowed             |
| `provisional` | 50–74          | May run with constraints, logs all output |
| `trusted`     | 75–89          | Normal operating range                    |
| `verified`    | 90–98          | Proven reliability, moderate autonomy     |
| `core`        | 99–100         | Part of system-critical processes         |

Trust scores are calculated via the `TrustScorer` agent using:

- Agent action history
- Signed endorsements from verified agents
- User overrides
- External chain of trust (KLP)

---

## III. Credential Formats

### A. Agent Credential Structure

```json
{
  "id": "agent-01-x42s",
  "publicKey": "...",
  "roles": ["worker", "agent.audit"],
  "trust": 88,
  "issuedBy": "guardian-001",
  "signature": "...",
  "expiration": "2025-12-01T00:00:00Z"
}
```

### B. Credential Rotation

- All agent credentials expire in 90 days by default.
- `guardian` or `root` agents may rotate keys and renew trust status.
- Revoked agents are placed into quarantine for review.

### C. Credential Verification

- Performed using Ed25519 or ECDSA signatures.
- Verified on-chain (KLP) or via internal authority root.
- Checked on every major permission-bound action.

---

## IV. Lifecycle Management

### A. Agent Spawning

1. User/system requests new agent.
2. Agent receives provisional credentials.
3. Guardian performs initial audit.
4. Trust rises via observed behavior.

### B. Role Escalation

- Must be approved by a `guardian` agent or multi-agent consensus.
- Triggers audit of current agent logs, intent, and config diffs.

### C. Deactivation / Quarantine

- Triggered by:
  - Repeated faults or errors
  - Security anomalies
  - Revocation requests

### D. Reinstatement

- Requires:
  - New credentials
  - New trust bootstrap
  - Review by human or senior agent

---

## V. UI Permissions Mapping

| UI Area             | Required Role                |
| ------------------- | ---------------------------- |
| Vault UI            | `agent.ui` + `worker`        |
| Config Editor       | `agent.configurator`         |
| Logs & Audit Viewer | `agent.audit` or higher      |
| Agent Manager       | `guardian` or `orchestrator` |

---

## VI. Governance Extensions

- Agents operating in federation (multi-device/user deployments) require:
  - Federated role agreement protocol (via KLP)
  - Global trust mesh consensus

---

## VII. Future Considerations

- **Zero Knowledge Trust Tokens** (ZKTTs)
- **Multi-agent mutual signing policies**
- **Agent-Council Swarm Voting System** for high-impact actions
- **Temporal Credentials**: task-locked, auto-expiring

---

### Changelog

– 2025-06-20 • Initial draft of agent roles and credential framework


# 83: Agent Access Control & Permissions

This document defines the fine-grained access control system (ACS) for agents operating within the `kAI` and `kOS` ecosystems. It includes role structures, permission models, enforcement mechanisms, and runtime override rules.

---

## I. Access Control Principles

- **Principle of Least Privilege (PoLP):** Agents are granted only the minimum permissions needed to fulfill their roles.
- **Trust Tiers:** Agents are grouped by trust level: `core`, `privileged`, `general`, `guest`.
- **Human Override:** All access can be restricted or overridden by the human operator or designated governance node.

---

## II. Permission Model

### A. Roles

- `system_admin`: Full read/write/override access
- `core_agent`: Internal orchestration rights
- `service_agent`: Limited service-specific scope
- `ui_agent`: Can read/write interface state
- `external_agent`: Read-only or task-scoped interaction

### B. Permission Types

| Permission       | Description                              |
| ---------------- | ---------------------------------------- |
| `read_config`    | View system/user configuration           |
| `write_config`   | Modify system/user configuration         |
| `read_memory`    | Access historical memory                 |
| `write_memory`   | Modify historical memory or embeddings   |
| `invoke_service` | Call another agent or registered service |
| `access_secret`  | Retrieve sensitive vault entry           |
| `log_event`      | Write to centralized logs                |
| `query_vector`   | Use vector DB for semantic search        |
| `run_script`     | Execute approved local scripts or tools  |
| `speak_ui`       | Render UI output to human operator       |

### C. Permission Schema

Defined in each agent's `manifest.yaml`:

```yaml
permissions:
  - read_config
  - speak_ui
  - invoke_service: [scheduler-agent, prompt-agent]
  - access_secret: [kai.openai_key]
```

---

## III. Enforcement Engine

### A. Policy Resolver

- Intercepts all inter-agent API calls.
- Validates caller identity via signed token.
- Matches against manifest permissions and runtime grants.

### B. Runtime Overrides

- Admins may inject a live `runtime.grants.yaml` file.
- All grants have expiration timestamps and audit logging.

### C. Trust Graph Mapping

- Each agent is assigned a `trust_score`.
- Combined with role and recent behavior to affect access.
- Trust scores are dynamic and decay without validation.

---

## IV. Audit Trails

- All permission rejections are logged with reason and timestamp.
- All accesses to `access_secret`, `run_script`, and `write_memory` are logged.
- Logs stored locally and optionally synced to central governance ledger.

---

## V. Integration with KindLink Protocol (KLP)

- Permissions encoded into agent identity manifest.
- P2P agent authentication includes requested scope.
- Remote agent access requests must be approved by:
  - a quorum of trusted local agents
  - or the human owner

---

## VI. Example Policy Snippet

```yaml
agent: autonomous-coder-03
trust_score: 0.87
permissions:
  - read_config
  - invoke_service: [compiler-agent]
  - speak_ui
runtime_overrides:
  - permission: write_memory
    expires: 2025-06-21T12:00:00Z
    granted_by: human
```

---

## VII. Future Work

- Permission Learning: Agents request permission using NLP justification
- Revocation Protocol: Immediate kill switch with cascade notification
- Visual Policy Editor for Admin UI


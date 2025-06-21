# 06: Agent Protocols and System Directory Structure

This document provides a complete breakdown of the system architecture, directory structure, and configuration protocols for all agent modules under the kAI (Kind AI) and kOS ecosystems.

---

## I. Master Directory Layout

```
kai/
├── agents/
│   ├── kCore/
│   │   ├── controller.py
│   │   ├── config/
│   │   │   ├── system.json
│   │   │   └── defaults.yml
│   │   ├── tasks/
│   │   │   └── startup.py
│   │   └── logs/
│   │       └── controller.log
│   ├── kPlanner/
│   │   ├── planner.py
│   │   ├── prompts/
│   │   └── config/planner.json
│   ├── kExecutor/
│   │   ├── executor.py
│   │   ├── plugins/
│   │   └── config/executor.json
│   ├── kReviewer/
│   ├── kMemory/
│   ├── kPersona/
│   ├── kBridge/
│   └── kSentinel/
├── comms/
│   ├── klp/
│   │   ├── schema.json
│   │   ├── transport_grpc.py
│   │   ├── transport_ws.py
│   │   ├── auth/
│   │   │   ├── signer.py
│   │   │   └── verifier.py
│   │   └── protocol_handler.py
│   └── mesh/
│       ├── local_mesh.py
│       └── remote_mesh.py
├── config/
│   ├── agents/
│   │   ├── manifest.json
│   │   ├── kExecutor:webscraper.json
│   │   └── kPlanner:research.json
│   ├── services.yml
│   └── global_settings.json
├── core/
│   ├── orchestrator.py
│   ├── scheduler.py
│   ├── dispatcher.py
│   └── logger.py
├── data/
│   ├── embeddings/
│   ├── memory/
│   └── vault/
├── logs/
│   ├── kCore/
│   ├── kPlanner/
│   └── global.log
├── plugins/
│   ├── generator_tools/
│   ├── validators/
│   └── external_apis/
├── security/
│   ├── keys/
│   ├── audit/
│   └── policies/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── simulation/
└── ui/
    ├── webapp/
    │   ├── components/
    │   ├── store/
    │   ├── pages/
    │   └── index.tsx
    └── themes/
        └── default.css
```

---

## II. Config Conventions

- All config files stored in `/config` follow one of:
  - `.json` → runtime settings, identities, manifests
  - `.yml` → user-editable service descriptions

```json
// /config/global_settings.json
{
  "debug_mode": true,
  "default_language": "en",
  "max_parallel_tasks": 5,
  "enable_mesh": true
}
```

---

## III. kLP Message Contract (Full Schema)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "KLPMessage",
  "type": "object",
  "required": ["type", "from", "to", "task_id", "payload"],
  "properties": {
    "type": { "type": "string", "enum": ["TASK_REQUEST", "TASK_RESULT", "STATUS_UPDATE"] },
    "from": { "type": "string" },
    "to": { "type": "string" },
    "task_id": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "payload": { "type": "object" },
    "auth": {
      "type": "object",
      "properties": {
        "signature": { "type": "string" },
        "token": { "type": "string" }
      }
    }
  }
}
```

---

## IV. Role-to-File Mapping Table

| Role      | Main File                      | Config Path                      | Notes                         |
| --------- | ------------------------------ | -------------------------------- | ----------------------------- |
| kCore     | `agents/kCore/controller.py`   | `config/global_settings.json`    | Primary runtime orchestrator  |
| kPlanner  | `agents/kPlanner/planner.py`   | `config/agents/kPlanner:*.json`  | Supports dynamic subroles     |
| kExecutor | `agents/kExecutor/executor.py` | `config/agents/kExecutor:*.json` | Pluggable execution handlers  |
| kBridge   | `agents/kBridge/bridge.py`     | `config/services.yml`            | Handles external API bindings |
| kSentinel | `agents/kSentinel/security.py` | `security/policies/*.yml`        | RBAC + anomaly detection      |

---

## V. Environment and Runtime Settings

### A. `.env.example`

```
POSTGRES_URL=postgresql://user:pass@localhost:5432/kai
REDIS_URL=redis://localhost:6379
VECTORDB=qdrant
DEBUG=true
ENABLE_KLP=true
AGENT_KEY_DIR=./security/keys
```

### B. Runtime Entrypoint

```python
# main.py
from core.orchestrator import start_system
start_system()
```

---

## VI. Notes for Future Expansion

- Each agent will eventually support containerization
- Persona overlays should exist in `/agents/kPersona/personas/*.yml`
- Vault should include in-memory + encrypted-disk tier
- KLP will support optional ZK token signing

---

### Changelog

– 2025-06-20 • Initial full blueprint for agent directory and system file structure – 2025-06-21 • Added full KLP schema, .env example, and runtime mappings


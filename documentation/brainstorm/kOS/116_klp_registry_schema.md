# 116: klp Registry Schema & Service Directory

This document defines the complete specification for the global and local registries used by `klp` (KindLink Protocol). These registries serve as the authoritative index for all agents, services, and interaction endpoints across the `kOS` and `kAI` ecosystems.

---

## I. Registry Types

### A. Local Node Registry

- **Location:** `/etc/kos/klp/registry.local.json`
- **Purpose:** Contains services and agents registered on a single user or mesh node.
- **Used By:** Local orchestrators, user dashboards, routing layer

### B. Global Cluster Registry

- **Location:** Synced via KindLink mesh overlay or optional federated central authority
- **Purpose:** Aggregate and synchronize identities, capabilities, endpoints, and schemas
- **Used By:** Federated agent routing, global discovery, trust evaluation

---

## II. Schema Definition

```json
{
  "node_id": "k-node-0453-abcd",
  "registry_version": "1.0.0",
  "updated": "2025-06-20T17:42:00Z",
  "services": [
    {
      "id": "chat-intent-router",
      "type": "intent_router",
      "labels": ["chat", "routing", "intent"],
      "description": "Routes natural language queries to appropriate services.",
      "endpoint": "http://localhost:4350/intents",
      "protocol": "http",
      "auth": "optional",
      "health_check": "/healthz",
      "methods": ["POST"],
      "version": "1.4.2",
      "tags": ["nlp", "intent-routing", "llm"],
      "rate_limit": {
        "per_minute": 60
      }
    },
    {
      "id": "vault-agent",
      "type": "agent",
      "description": "Local credential vault and secure data handler",
      "endpoint": "http://localhost:4330",
      "protocol": "http",
      "auth": "required",
      "capabilities": ["encryption", "decryption", "vault_access"],
      "version": "2.0.1"
    }
  ],
  "agents": [
    {
      "id": "agent-plan-k005",
      "type": "planner",
      "modules": ["task_planning", "intent_analysis"],
      "identity": "did:kai:planner:k005",
      "trust_level": "signed",
      "version": "0.9.8",
      "entrypoint": "/run-agent.sh",
      "mesh_discovery": true
    }
  ]
}
```

---

## III. Service Types

| Type             | Description                             |
| ---------------- | --------------------------------------- |
| `agent`          | Executable logical unit with autonomy   |
| `service`        | REST/gRPC callable microservice         |
| `intent_router`  | NLP-driven dynamic router               |
| `indexer`        | Search and tag data stores and concepts |
| `vector_service` | Manages embeddings and retrievals       |
| `file_host`      | Hosts artifacts and binary assets       |
| `logger`         | Central event and activity logging      |
| `ui_component`   | Web component or user frontend renderer |

---

## IV. Discovery & Trust

- **Trust levels:**

  - `local_only`
  - `signed`
  - `verified`
  - `trusted_peer`
  - `federated_root`

- **Discovery methods:**

  - `KindLink mesh gossip`
  - `Intent announcements`
  - `Manual publish via CLI` (`klink publish`)
  - `Service beacon broadcast`

---

## V. Registry Update Operations

### A. Add a New Service

```bash
klink register-service --file ./my_service.json
```

### B. Remove a Service

```bash
klink remove-service --id vault-agent
```

### C. Sync to Mesh

```bash
klink sync --scope local-to-global
```

---

## VI. CLI Tool: `klink`

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `klink list`      | List all local registered entries     |
| `klink publish`   | Publish local registry entry to mesh  |
| `klink trust`     | Trust a remote registry or peer       |
| `klink verify`    | Verify and hash sign local entries    |
| `klink bootstrap` | Re-initialize or rebuild the registry |

---

## VII. Integration Targets

- **kAI Orchestrator**: dynamically queries `registry.local.json` to route requests
- **Agent Runner**: loads agent capabilities via lookup
- **Trust Evaluator**: filters access based on trust levels
- **UI Selector**: provides dropdowns for service binding
- **Analytics UI**: tracks service usage from registry logs

---

### Changelog

– 2025-06-21 • Initial full schema and usage definition


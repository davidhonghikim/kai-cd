# 80: Agent Deployment Specs & Configurations

This document defines the comprehensive deployment standards, environment configurations, lifecycle management, and upgrade pathways for agents within the `kAI` and `kOS` environments.

---

## I. Deployment Modes

### A. Local Deployment

- **Runtime:** Node.js, Python, or embedded in browser extension (kAI)
- **Storage:** Local filesystem / SQLite / IndexedDB (browser)
- **Network Access:** LAN only or loopback (127.0.0.1)
- **Use Case:** Personal assistants, developer tools, embedded logic

### B. Containerized Deployment

- **Tools:** Docker, Podman
- **Runtime:** Language-agnostic (via base images)
- **Volume Mounts:**
  - `/data` → agent memory
  - `/secrets` → credentials and vault access
- **Ports:** Dynamically assigned or declaratively defined via config
- **Use Case:** Utility services, edge compute agents

### C. Distributed Mesh Node

- **Runtime:** Reticulum (LoRaMesh or TCP mesh)
- **Discovery:** TrustLinkGraph overlay network
- **Identity:** Signed peer manifest with agent ID, modules, trust level
- **Use Case:** Federated knowledge agents, community swarms, offline mesh compute

### D. Cloud / Server Deployment

- **Host:** VPS, K8s Cluster, Serverless Function
- **Persistence:** PostgreSQL, Redis, Qdrant
- **Auth:** OAuth2, JWT, KindLink Protocol
- **Use Case:** High availability agents, orchestrators, public-facing interfaces

---

## II. Deployment Manifest Format

All agents must ship with a `deploy.config.yaml` file, describing:

```yaml
id: agent-vault-001
version: 0.4.3
entrypoint: ./main.py
runtime: python3.11
modules:
  - MemoryCore
  - SecurePrompt
  - SchedulerUnit

mounts:
  /data: ./persistent/
  /secrets: ./vault/

env:
  VAULT_KEY: ${VAULT_KEY}
  TIMEOUT_SECONDS: 300

auth:
  required: true
  type: bearer_token

network:
  port: 4501
  protocol: http
  mesh_discovery: true
```

---

## III. Lifecycle Management

### A. States

- `init` → `ready` → `active` → `suspended` → `terminated`

### B. Update Mechanism

- **Auto-Upgrades:** Agents check `/updates/{agent_id}`
- **Delta Sync:** Pull only changed components
- **Rollback:** Versioned archives with SHA-256 signature validation

### C. Agent Integrity

- Hash validation on all loaded modules
- Live memory self-audit every N minutes
- Signed audit logs on critical action triggers

---

## IV. Compatibility Matrix

| Platform | Supported | Notes                                           |
| -------- | --------- | ----------------------------------------------- |
| kAI      | ✅         | Browser + Localhost + API bridge                |
| kOS      | ✅         | Full agent protocol stack supported             |
| CLI Tool | ✅         | Standalone agents with stdin/stdout interaction |
| Mobile   | ⬜         | Partial support (planned via WASM + SQLite)     |

---

## V. Agent Upgrade Channels

### A. `stable`

- Only verified builds
- Passed security audits
- Default for user-facing agents

### B. `beta`

- Pre-release features
- Minor regression risk
- For test environments

### C. `nightly`

- Latest commit builds
- Used only for dev agents and self-improving swarm simulations

---

## VI. Example Deployment Scenarios

### 1. DailyAssistant in Personal Browser (kAI)

- Deployed via `kai-cd` extension
- IndexedDB for memory, WebCrypto for secret storage
- Config via GUI + `localStorage` snapshot

### 2. SecureVaultAgent on Edge Server

- Docker container with QEMU for ARM edge nodes
- Vault credentials injected at runtime via HashiCorp Vault API

### 3. SwarmAgent Node in Reticulum Mesh

- Signed with ECC key, publishes capabilities
- Auto-discovers peers via KindLink overlay
- Shares computation requests using gossip relay protocol

---

## VII. Future Expansion

- WASM Agent Targets for in-browser advanced agents
- Dynamic Agent Builder UI
- Voice-Driven Deployment ("spin up planner")
- Agent Lifecycle Graph UI

---

### Changelog

– 2025-06-20 • Initial deployment spec draft


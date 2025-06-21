# 09: Service Architecture and System Topology

This document details the complete modular service architecture of the `kOS` (kindOS) and `kAI` (kindAI) platform, including low-level breakdowns of all system components, communication protocols, software modules, and deployment models. It serves as the core blueprint for infrastructure and runtime integration.

---

## I. Architectural Layers

### A. User Layer (Client Interfaces)

- **kAI Web App (kai-cd)**
  - React + Tailwind CSS
  - Built-in theme engine and accessibility layer
  - Chrome extension / tab / popup / sidepanel
  - WebSocket API + REST API client
  - Supports plugin UIs, iframe sandboxed services, and real-time interaction
- **kAI Terminal Interface (CLI)**
  - Node.js REPL + Python fallback
  - Local agent control and diagnostic tools
  - Encrypted local config and vault integration
- **Mobile Client (Planned)**
  - React Native app wrapper for core kAI modules
  - Push notification + camera/mic sensors

### B. Control Layer

- **Agent Mesh Runtime**
  - `kCore` orchestrates all agents
  - All agents registered with `manifest.json`
  - Mutual auth via Ed25519 identity keys
  - Agents live on:
    - localhost (default)
    - LAN via mDNS
    - Cloud RPC (gRPC/WebSocket)
- **Central Orchestration Bus**
  - Redis pub/sub or NATS for lightweight broadcasting
  - WebSocket relay server for browser <-> backend messaging
  - API Gateway (FastAPI / Envoy / Nginx)

### C. Infrastructure Layer

- **Backend Services**
  - FastAPI (core API service)
  - LangChain (for orchestration and chaining)
  - Celery (for async tasks)
  - Vector Store Manager (Chroma, Qdrant, Weaviate)
  - Secure Vault API (AES-256 local or remote KMS)
- **Data Stores**
  - PostgreSQL (primary structured DB)
  - Redis (cache, short-term memory)
  - S3/GCS (file and artifact storage)
- **LLM Provider Interfaces**
  - Local Models (Ollama, llama.cpp, vLLM)
  - Remote APIs (OpenAI, Claude, Gemini, HuggingFace)

---

## II. Component Breakdown (by Subsystem)

### A. Prompt Management System

```
components/prompt_manager/
├── PromptStore.ts         # IndexedDB local prompt history
├── PromptProfile.ts       # Named context templates
├── PromptEditor.tsx       # WYSIWYG + markdown hybrid
├── PromptRenderer.ts      # Inject runtime variables
├── PromptVaultAdapter.ts  # Connect to secure vault
```

### B. Agent Mesh

```
services/agents/
├── kCore/                  # Orchestrator runtime
├── kPlanner/               # Goal decomposition
├── kExecutor/              # Task runners
├── kReviewer/              # QA and test evaluation
├── kSentinel/              # Monitoring and intrusion detection
├── kMemory/                # Memory graph and embedding
├── kPersona/               # Persona config and modulation
├── kBridge/                # API proxies and adapters
```

### C. Artifact Manager

```
services/artifact_manager/
├── ArtifactIndex.ts        # Metadata and hash DB
├── UploadHandler.ts        # File and blob intake
├── PreviewRenderer.tsx     # Markdown, image, and PDF rendering
├── ShareLink.ts            # Temporary signed URLs
├── SignatureVerifier.ts    # Blockchain-backed checksum (planned)
```

### D. Config and Vault System

```
config/
├── system_config.json      # Global toggles, logging, themes
├── user_config.json        # Local overrides, profile info
├── vault/
│   ├── secrets.db          # AES-encrypted SQLite store
│   └── policy.json         # Access rules and TTL config
```

---

## III. Core Protocols and Service APIs

### A. WebSocket Message Structure

```json
{
  "type": "AGENT_RESULT",
  "agent": "kExecutor:webscraper",
  "task_id": "xyz123",
  "payload": {
    "status": "success",
    "data": { ... }
  },
  "timestamp": "2025-06-20T23:05:00Z"
}
```

### B. Internal Service APIs

- `POST /agent/task` → Submit new goal or subtask
- `GET /agent/status` → List agent health, state
- `POST /vault/encrypt` / `POST /vault/decrypt`
- `POST /artifact/upload` / `GET /artifact/:id`
- `GET /memory/search?q=...`
- `POST /planner/plan`

---

## IV. Deployment Models

### A. Localhost (Developer Mode)

- All services and agents run on a single machine
- Local SQLite + Ollama + FastAPI stack
- CLI + Web UI on `http://localhost:3000`

### B. Home Server (Self-Hosted Node)

- Docker Compose with shared volumes
- Agents in separate containers
- Optional public tunnel (e.g. `ngrok`, `tailscale`)

### C. Multi-Tenant Cloud

- Kubernetes or Nomad for orchestration
- S3, Postgres, Redis in HA mode
- Central admin UI for tenant control

### D. Federated Mesh (Planned)

- Peered mesh of `kCore` nodes
- Each node signs and publishes blocks to shared ledger
- IPFS or RAG-2 knowledge sync

---

## V. Security Components

- **Vault**: AES-256 + PBKDF2 local, or KMS cloud mode
- **JWT / OAuth2**: Auth layer for user and agent tokens
- **Ed25519 Signatures**: For all agent communication (via KLP)
- **Sandboxed Plugin Runner**: WebWorker or nsjail-based
- **kSentinel Hooks**:
  - Rate limiting, anomaly detection
  - Execution trace logging
  - Resource monitoring (CPU, memory, net)

---

## VI. System Observability

- **Grafana + Loki**: Log dashboard
- **Prometheus**: Agent performance metrics
- **Jaeger**: Task trace and profiling
- **SQLite Log Adapter**: For lightweight debugging

---

## VII. Naming Conventions & Structure

- Service routes follow: `/service_name/function`
- Agent IDs follow: `kClass:name`
- All internal logs tagged with task ID and plan ID
- Config file overrides resolved via deep merge

---

## Changelog

– 2025-06-21 • Initial full version of complete service architecture, agents, protocols, and deployment modes.


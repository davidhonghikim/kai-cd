# 170: Modular Deployment Modes for kAI/kOS

This document defines all supported deployment modes for the `kAI` (Kind AI) and `kOS` (Kind Operating System) ecosystem, with detailed configuration schemas, runtime topologies, platform-specific considerations, and component orchestration strategies.

---

## I. Objectives

- Define all standardized deployment environments
- Optimize for scalability, performance, and device constraints
- Enable seamless migration from one mode to another (e.g., local to server to cluster)
- Ensure security and performance isolation across services
- Support embedded edge devices, browsers, desktop, server, and cloud clusters

---

## II. Deployment Modes Overview

| Mode         | Description                                         | Primary Use Case                      |
| ------------ | --------------------------------------------------- | ------------------------------------- |
| `standalone` | Full system on one local device                     | Personal usage, developer workstation |
| `browser`    | Browser extension + IndexedDB backend               | End-user assistant, PWA mode          |
| `embedded`   | On-device (e.g., wearable, IoT, robot)              | kOS runtime on custom hardware        |
| `server`     | Backend server + remote clients                     | Team or home network environments     |
| `cluster`    | Distributed multi-agent with autoscaling + API mesh | Org-wide deployments, research labs   |

---

## III. Mode Definitions

### A. Standalone Mode (Desktop/Local)

- **Frontend:** React/Tauri or Electron
- **Backend:** FastAPI, SQLite, local-only Redis
- **Data:** File system + IndexedDB
- **Security:** Local vault, local-only JWT tokens
- **Services:** Ollama, A1111, ComfyUI, local Qdrant

```yaml
standalone:
  storage:
    db: sqlite
    files: ./data/files/
  auth:
    mode: none
  services:
    ollama: true
    comfyui: true
    chroma: true
  features:
    auto_update: false
    telemetry: false
```

### B. Browser Mode (Kai-CD Extension)

- **Runtime:** Chrome/Firefox extension + IndexedDB
- **APIs:** WebRTC, WebSocket, local HTTP bridge
- **UI:** Minimal popup/sidepanel/tab interface
- **Limitations:** No persistent backend or task queue

```json
{
  "mode": "browser",
  "data_store": "indexeddb",
  "sync_with_kOS": false,
  "local_services": ["open-webui", "ollama"],
  "telemetry": false
}
```

### C. Embedded Mode (IoT, Mobile, Wearable)

- **Runtime:** MicroPython / TFLite / Rust
- **Platform:** Android Things, Raspbian, ESP32, Fuchsia
- **Communication:** MQTT + KLP (Kind Link Protocol)
- **UI:** Voice + LED + haptic only (optional minimal UI)
- **Security:** Hardware keys, minimal OS

```toml
[embedded]
klp_enabled = true
mqtt_host = "10.0.0.1"
device_id = "kai_rpi_001"
heartbeat_interval = 60
voice_ui = true
```

### D. Server Mode

- **Backend:** FastAPI + Celery + PostgreSQL
- **Frontend:** Remote SPA or native app
- **LLMs:** Shared GPU node or remote APIs
- **Security:** OAuth2 + Vault + JWT
- **Persistence:** Redis cache, S3 storage, Prometheus

```ini
[server]
db_url = postgresql://kai:kai@localhost/kos
celery_broker = redis://localhost:6379/0
log_retention_days = 30
auth_provider = oidc
vector_store = qdrant
```

### E. Cluster Mode (Distributed Multi-Agent)

- **Mesh:** NATS + Envoy + KLP
- **Orchestration:** Docker Swarm / Kubernetes / Nomad
- **Storage:** Cloud-native (S3, CloudSQL, Elasticache, etc.)
- **Agents:** Isolated by namespace and trust zone
- **Use Cases:** Autonomous multi-agent orgs, hospitals, research labs

```yaml
cluster:
  orchestrator: kubernetes
  control_plane:
    agents: 10
    trust_zones: ["public", "internal"]
  services:
    nats: true
    envoy: true
    vector_db: qdrant-cloud
  secrets:
    vault_provider: aws_kms
    rotate_interval: 7d
```

---

## IV. Migration Paths

| From       | To         | Supported? | Migration Method                    |
| ---------- | ---------- | ---------- | ----------------------------------- |
| standalone | server     | ✅          | Export DB, reattach Redis           |
| browser    | standalone | ✅          | Use export/import from popup UI     |
| embedded   | server     | ✅          | MQTT bridge + KLP                   |
| server     | cluster    | ✅          | Helm charts + agent replica configs |

---

## V. Mode-Specific Debug Tools

| Mode       | Tools                                                                |
| ---------- | -------------------------------------------------------------------- |
| standalone | `devtools-agent`, local `tail-log` UI                                |
| browser    | IndexedDB browser tools, extension debug console                     |
| embedded   | UART serial debug, voice telemetry logs                              |
| server     | Grafana, Prometheus, Loki, OpenTelemetry                             |
| cluster    | Kiali, Jaeger, distributed tracing dashboards, kAI Inspector Console |

---

## VI. Future Modes

- **Federated kAI Swarms:** Shared computation across mobile peers via WebRTC mesh
- **Bare-Metal kOS:** Direct Linux-style OS running agents as services
- **Quantum-Linked kAI:** Experimental KLP node sync over post-quantum mesh routing

---

### Changelog

– 2025-06-22 • Initial draft of modular deployment profiles and orchestration schema


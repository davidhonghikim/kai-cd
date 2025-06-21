# 36: Service & Agent Manager – kOS Runtime Layer

This document defines the core architectural services, orchestration layer, and system configurations that manage all service integrations, agent registration, coordination, routing, runtime state, and diagnostics in the kAI + kOS ecosystem.

---

## I. Purpose

The Service & Agent Manager (SAM) acts as the central registry, runtime supervisor, and dynamic router across all active components in the kOS/kAI system. It ensures:

- Agent lifecycle orchestration (load, suspend, terminate, restart)
- Service availability resolution
- API proxying and gateway routing
- Real-time status dashboards
- Diagnostic tooling and health checks
- Centralized service & agent configuration

---

## II. Directory Structure

```text
src/
└── core/
    ├── agents/
    │   ├── AgentRegistry.ts               # Canonical list of all registered agents
    │   ├── AgentSupervisor.ts             # Starts/stops agents, monitors health
    │   └── AgentHeartbeat.ts              # Periodic agent ping, TTL, restart logic
    ├── services/
    │   ├── ServiceRegistry.ts             # Canonical service discovery list
    │   ├── ServiceOrchestrator.ts         # Mount/Unmount, lifecycle hooks
    │   └── ServiceProxyRouter.ts          # Universal API proxy layer (OpenAPI-aware)
    ├── runtime/
    │   ├── RuntimeStore.ts                # Central shared memory store
    │   ├── StateWatchers.ts               # Observable reactivity + diagnostics
    │   ├── CapabilityResolver.ts          # Dynamic feature detection (for UI)
    │   └── StatusDashboard.tsx            # Admin UI panel showing live state
    ├── config/
    │   ├── defaults.json                  # Global service & agent defaults
    │   ├── system.yaml                    # System bootloader config
    │   ├── local-overrides.yaml           # Per-device overrides
    │   └── configLoader.ts                # Merges and validates configs
    └── diagnostics/
        ├── LogCollector.ts               # Structured runtime log gatherer
        ├── CrashReporter.ts              # Error catcher with trace & memory snapshot
        └── Watchdog.ts                   # Runtime health & auto-restart
```

---

## III. Configuration System

### A. File Hierarchy
- `/config/defaults.json`: Static baseline config
- `/config/system.yaml`: System-level overrides per deployment
- `/config/local-overrides.yaml`: Developer machine-specific patches

### B. Sample Agent Entry
```yaml
agents:
  summaryAgent:
    enabled: true
    version: "1.0.2"
    path: "src/agents/summary"
    persona: "academic"
    runtime: "local"
    env:
      OPENAI_KEY: ${env.OPENAI_KEY}
    restart_on_crash: true
    dependencies:
      - langchain
      - openai
```

### C. Sample Service Entry
```yaml
services:
  qdrant:
    type: "vector-store"
    enabled: true
    port: 6333
    containerized: true
    healthcheck: "/health"
    restart_policy: "on-failure"
```

---

## IV. Key Components

### 1. AgentRegistry
- Maintains manifest of every known agent
- Stores version, persona, last-seen, capabilities
- Provides lookup for orchestrators and UI

### 2. AgentSupervisor
- Loads and isolates agents into secure runtimes
- TTL monitor and crash autorestart
- Sandboxes agent based on defined security profile

### 3. ServiceProxyRouter
- Exposes all integrated APIs on local unified route:
  - `http://localhost:4040/api/{service}/{path}`
- Can handle token injection, caching, failover, retries
- Auto-docs UI using Swagger/OpenAPI overlay

### 4. RuntimeStore
- Uses Zustand, Jotai or custom in-memory graph
- Shared across agent runtime containers (via bridge or worker)
- Emits change events for dashboards and watchers

### 5. StatusDashboard
- React-based internal UI
- Displays live:
  - Agent health
  - Service up/down
  - Last activity timestamp
  - Errors, crashes, logs

---

## V. Runtime Monitoring & Diagnostics

### A. LogCollector
- Streams structured logs from every agent/service
- Tags by `agentId`, `level`, `timestamp`
- Outputs to local filesystem + optional cloud collector

### B. CrashReporter
- Captures stack trace + memory snapshot on failure
- Logs to `crashlog/` + emits diagnostic event to dashboard

### C. Watchdog
- Pings each agent & service on a set interval
- Marks stale or nonresponsive entries
- Initiates auto-restart if policy allows

---

## VI. Integration with kAI + kOS

### Cross-System Communication
- Registers itself with `Modular Agent Protocol (MAP)`
- Available via pub/sub event bus: `agent/sam/*`
- Emits contract metadata, agent stats, system alerts

### APIs Exposed
```ts
GET /api/agents            // List all registered agents
GET /api/services          // List running services
POST /api/agent/:id/start  // Start/restart agent
POST /api/agent/:id/stop   // Stop agent
GET /api/status            // Full runtime status dump
```

---

## VII. Security Notes

- Secure boot of config files (GPG signed optional)
- All agent sandboxes must follow namespace isolation
- Signed contract-based permission for inter-agent calls
- Audit logging enabled by default
- Encrypted agent state stored with optional Vault integration

---

## VIII. Future Roadmap

| Feature                     | ETA      |
|----------------------------|----------|
| Service health scoring     | v1.2     |
| Plugin hot-reload          | v1.3     |
| Distributed supervisor     | v2.0     |
| UI auth (admin dashboard)  | v2.0     |
| Multi-device sync          | v2.1     |


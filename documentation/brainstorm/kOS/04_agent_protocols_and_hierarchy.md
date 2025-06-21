# 04: Agent Protocols and Role Hierarchy

This document defines the hierarchical structure, communication standards, coordination logic, configuration protocols, and execution framework for all AI agents operating within the kindAI (kAI) and kindOS (kOS) ecosystem. It is structured to support modular, extensible, and secure coordination between agents across distributed environments.

---

## I. Agent Role Hierarchy

### A. Agent Classes (by Responsibility Scope)

| Class          | Role               | Description                                                                                         |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `kCore`        | Primary Controller | Global coordinator agent. Oversees all agent lifecycles, routing, and system configuration.         |
| `kCoordinator` | Domain Coordinator | Manages a sub-domain (e.g., Health, Scheduling, Research). Assigns work to planners and evaluators. |
| `kPlanner`     | Planner Agent      | Converts user goals into tasks. Queries knowledge base, generates task graphs.                      |
| `kExecutor`    | Worker Agent       | Executes a single task (code run, API call, data retrieval). Pure execution, no reasoning.          |
| `kReviewer`    | Evaluator Agent    | Performs QA, test coverage, output verification, formatting, consistency checking.                  |
| `kSentinel`    | Security Agent     | Monitors for anomalies, performs boundary enforcement, access control, usage audits.                |
| `kMemory`      | Memory Agent       | Handles memory retrieval, summarization, embedding, and memory map updates.                         |
| `kPersona`     | Persona Host       | Maintains persona constraints, tone, context, user alignment.                                       |
| `kBridge`      | Service Proxy      | Acts as a connector between external APIs and internal service mesh.                                |

### B. Agent Types (by Interaction Mode)

- `Active`: Initiates tasks autonomously or by schedule.
- `Reactive`: Waits for user or agent requests.
- `Hybrid`: Periodically monitors context + responds to triggers.

---

## II. Inter-Agent Communication (KLP - Kind Link Protocol)

### A. Message Types

- `TASK_REQUEST`
- `TASK_RESULT`
- `TASK_ERROR`
- `STATUS_UPDATE`
- `INTENTION_DECLARATION`
- `MEMORY_READ/WRITE`
- `PLAN_GRAPH`
- `SECURITY_ALERT`
- `CONFIG_UPDATE`

### B. Message Structure

```json
{
  "type": "TASK_REQUEST",
  "from": "kPlanner:research",
  "to": "kExecutor:webscraper",
  "task_id": "abc123",
  "payload": {
    "action": "scrape",
    "target": "https://example.com",
    "params": {}
  },
  "timestamp": "2025-06-20T22:04:00Z",
  "auth": {
    "signature": "ed25519:...",
    "token": "..."
  }
}
```

### C. Transport Protocols

- `WebSocket` for local real-time mesh
- `gRPC` for high-performance backend microservices
- `MQTT` or `NATS` for lightweight mesh broadcasting
- `REST` fallback for HTTP-based integrations

### D. Authentication / Authorization

- Mutual agent identity via Ed25519 / RSA keys
- Role-based ACLs enforced via `kSentinel`
- Tokens for API-level auth via OAuth2 / JWT

---

## III. Execution Protocol

### A. Task Lifecycle

1. **Goal Created** → by user or `kCore`
2. **Plan Generated** → by `kPlanner`
3. **Subtasks Spawned** → sent to `kExecutor`
4. **Execution + Logging** → results reported back
5. **Review** → `kReviewer` checks integrity, correctness
6. **Memory Update** → `kMemory` embeds or indexes output

### B. Traceability

Each task is tagged with:

- `task_id`
- `parent_id`
- `plan_id`
- `agent_id`
- `timestamp`
- `resource_footprint`

### C. Failure Handling

- Automatic retry via `kCoordinator`
- Escalation to user or fallback plan
- Retry throttling and loop detection

---

## IV. Configuration and Synchronization

### A. Global Agent Manifest

Stored at `config/agents/manifest.json`

```json
{
  "agents": [
    { "id": "kPlanner:research", "type": "planner", "class": "kPlanner", "active": true },
    { "id": "kExecutor:webscraper", "type": "executor", "class": "kExecutor", "active": true },
    ...
  ]
}
```

### B. Agent Configuration Files

Stored in `config/agents/<agent_id>.json`

```json
{
  "name": "Research Planner",
  "allowed_domains": ["knowledge", "science"],
  "max_tasks": 5,
  "persona": "Analytical, Efficient",
  "autonomy_level": "high",
  "enabled": true
}
```

### C. Central Control Dashboard (Planned)

- Global state view
- Force restart, suspend, reconfigure agents
- Performance charts
- Message log inspection
- Role reassignment

---

## V. Observability and Logging

### A. Event Log Types

- Agent startup/shutdown
- Message sent/received
- Execution begin/end
- Errors and exceptions
- Security violations
- Memory read/write events

### B. Storage Targets

- `logs/agents/agent_id/date.log`
- `cloud_logs/` (optional: Grafana Loki, S3 backup)
- `sqlite://logs.db` (indexing and query)

### C. Analysis Tools

- Log parser + visualizer UI (kAI plugin)
- Time series viewer
- JSON query console (jq or equivalent)

---

## VI. Roadmap & Expansion

| Feature                     | Description                            | Target Version |
| --------------------------- | -------------------------------------- | -------------- |
| 🔲 Agent Containerization   | Isolated runtime with audit hooks      | v1.1           |
| 🔲 Persona Overlay System   | Real-time personality modulation       | v1.2           |
| 🔲 Distributed Mesh Routing | Agent swarm routing (local + global)   | v2.0           |
| 🔲 ZK Agent Voting          | Zero Knowledge-based decisions         | v2.1           |
| 🔲 Hardware Bridge Layer    | Raspberry Pi, ESP32, and robot control | v2.2           |

---

### Changelog

– 2025-06-20 • Initial version with full hierarchy, protocols, and config structures.


# 214: Low Level RPC Interfaces and Inter-Agent Communication

> This document specifies the complete low-level communication protocols between services, agents, and system modules within the kOS/kAI ecosystem. It includes request/response schemas, timeout conventions, retry mechanisms, and telemetry requirements.

---

## 1. Overview

The kOS ecosystem uses a hybrid of REST, WebSocket, and internal RPC mechanisms depending on latency, persistence, and real-time needs. This document covers the internal **Agent-Module RPC Interface (AMRI)** protocol, which is the foundation for service-to-service communication within the distributed system.

## 2. RPC Layer Responsibilities

The RPC system is responsible for:

- Transport-agnostic API contract enforcement
- Timeout and retry configuration
- Structured logging and telemetry injection
- Versioned message schemas
- JSON serialization/deserialization
- Request context propagation (e.g. trace\_id, user\_id)

## 3. Transport Backends

The following are supported:

- REST (FastAPI) — External-facing modules
- WebSocket — Streamed or persistent session-based communication
- **gRPC (Planned)** — Binary transport for high-performance internal communication
- **Local JSON-RPC** — Default for single-node or in-memory simulations

## 4. Request Envelope Schema

```json
{
  "id": "uuid-v4",
  "origin": "kAI.module.id",
  "destination": "kAI.agent.id",
  "timestamp": 1718963981,
  "method": "string.rpc.verb",
  "params": {},
  "headers": {
    "trace_id": "uuid-v4",
    "auth_token": "optional.jwt",
    "user_id": "uuid",
    "ttl": 10000
  }
}
```

## 5. Response Envelope Schema

```json
{
  "id": "uuid-v4",
  "origin": "kAI.agent.id",
  "destination": "kAI.module.id",
  "timestamp": 1718963983,
  "result": {},
  "error": null,
  "metrics": {
    "latency_ms": 125,
    "retries": 1,
    "backend": "WebSocket"
  }
}
```

If an error occurs:

```json
{
  "result": null,
  "error": {
    "code": 403,
    "message": "Unauthorized agent",
    "stack": "Traceback (most recent call...)"
  }
}
```

---

## 6. Agent Handshake Protocol

Used for registration of new agents/modules:

**Request:**

```json
{
  "method": "agent.register",
  "params": {
    "capabilities": ["llm_chat", "media_gen", "memory.store"],
    "intents": ["serve"],
    "metadata": {
      "hostname": "node-12.local",
      "version": "1.4.0",
      "load": 0.13
    }
  }
}
```

**Response:**

```json
{
  "result": {
    "agent_id": "kAI.memory.3277",
    "accepted": true,
    "heartbeat_interval": 10
  }
}
```

## 7. Retry / Timeout Configuration

| Request Type  | Timeout (ms) | Retries | Backoff     |
| ------------- | ------------ | ------- | ----------- |
| `agent.*`     | 5000         | 3       | Linear (1s) |
| `memory.*`    | 2500         | 2       | Exponential |
| `llm_chat.*`  | 10000        | 1       | None        |
| `media_gen.*` | 15000        | 0       | None        |

Failure metrics must be recorded with full trace context.

## 8. Telemetry Injection

The RPC layer wraps all outgoing requests with:

- `trace_id` from session
- `user_id` from vault session
- `correlation_id` if part of a workflow
- `source_agent`, `target_agent`

Telemetry events must be sent to `kOS.telemetry.bus` with event metadata.

---

## 9. Service Routing Table Example

```json
{
  "llm.chat": "kAI.llm.openai",
  "llm.stream": "kAI.llm.ollama",
  "media.generate": "kAI.media.stable",
  "memory.query": "kAI.memory.qdrant",
  "workflow.orchestrate": "kAI.workflow.root"
}
```

Routing is handled via `KLP` (Kind Link Protocol) service discovery and updates dynamically via service heartbeat and registration events.

---

## 10. Development Directories

```text
/core/
  /rpc/
    handler.py          # Main RPC router (FastAPI, WebSocket, JSON-RPC)
    client.py           # Unified request client with retry/backoff logic
    schemas.py          # Strict pydantic schemas for request/response
    transport/
      websocket.py
      rest.py
      jsonrpc.py
    metrics.py          # Telemetry hooks, retry stats, latency logging
  /registry/
    services.json       # Dynamic registry of agents & services
    router.py           # Resolver for routing table
    auth.py             # Signature and token validation
```

---

## 11. Testing & Debugging

Use `/core/devtools/rpc_test_client.py` to manually invoke requests, simulate timeouts, inspect retries.

```bash
python rpc_test_client.py --method memory.query --params '{"q": "cat"}'
```

---

## 12. Related Protocols

- `KLP` — Kind Link Protocol for agent/service discovery
- `AuthX` — KindAI security token protocol
- `ATS` — Agent Trust Signaling handshake

---

### Changelog

– 2025-06-20 • Initial draft of RPC structure (LLM agent)


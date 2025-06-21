# 199: kAI API and Socket Services

This document defines the full architecture, routes, data contracts, and implementation layers of the kAI (Kind AI) API and real-time WebSocket services. These services are foundational to enabling real-time multi-agent coordination, human-AI interaction, secure task orchestration, and agent lifecycle management.

---

## I. Service Overview

### A. Purpose

- Serve as the central API and WebSocket interface for kAI multi-agent system.
- Enable client applications (web, desktop, mobile, CLI) to interact with agents in real-time.
- Provide secure authentication, session management, command handling, file uploads, prompt streaming, and agent registration.

### B. Core Technologies

- **Framework:** FastAPI (REST + async WebSocket support)
- **WebSockets:** `fastapi-websockets`, `socket.io`, fallback to `sse-starlette`
- **Auth:** OAuth2, JWT, optional passwordless login with magic link
- **Task Queue:** Celery w/ Redis backend (asynchronous background task support)
- **Persistence:** PostgreSQL (user, agent, session data)
- **Vector/Blob Access:** Qdrant, Redis, S3, Local Filesystem

---

## II. API Structure

### A. Base Path

```
/api/
```

### B. Auth Routes

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/session
POST /api/auth/verify-magic
```

### C. Agent Management

```http
GET  /api/agents
POST /api/agents
PUT  /api/agents/{agent_id}
GET  /api/agents/{agent_id}/status
POST /api/agents/{agent_id}/restart
DELETE /api/agents/{agent_id}
```

### D. Command Routing & Tasks

```http
POST /api/agents/{agent_id}/command
POST /api/agents/{agent_id}/upload
POST /api/agents/{agent_id}/stream-prompt
POST /api/agents/{agent_id}/task
GET  /api/agents/{agent_id}/logs
GET  /api/tasks/{task_id}/status
```

### E. Blob/File Handling

```http
POST /api/files/upload
GET  /api/files/{file_id}/download
GET  /api/files
DELETE /api/files/{file_id}
```

### F. Config Management

```http
GET  /api/config/system
POST /api/config/system
GET  /api/config/user
POST /api/config/user
```

### G. Toolchain & Service Registration

```http
GET /api/services
POST /api/services
POST /api/services/discover
POST /api/services/{service_id}/refresh
```

---

## III. WebSocket Events (Bidirectional)

### A. Base Endpoint

```
/ws/agents/{agent_id}
```

### B. Server-to-Client Events

```json
{
  "type": "status_update",
  "status": "active|idle|offline|error",
  "timestamp": "2025-06-20T15:00:00Z"
}
```

```json
{
  "type": "log",
  "message": "Agent started new task",
  "level": "info|error|warn",
  "timestamp": "2025-06-20T15:00:00Z"
}
```

```json
{
  "type": "stream_chunk",
  "stream_id": "xyz",
  "chunk": "partial token",
  "done": false
}
```

### C. Client-to-Server Events

```json
{
  "type": "command",
  "command": "search_web",
  "params": {
    "query": "current weather"
  }
}
```

```json
{
  "type": "upload",
  "filename": "report.pdf",
  "base64": "..."
}
```

```json
{
  "type": "heartbeat",
  "agent_id": "kai-001"
}
```

---

## IV. Internal System Interfaces

### A. Service Registry

- Keeps track of running agents, tools, services (from service definitions)
- Indexed via Redis or in-memory cache
- Auto-refresh from heartbeat WebSocket events

### B. Prompt Stream Router

- Allows streaming prompts via WebSocket or HTTP chunked transfer
- Each stream gets unique ID and state tracker

### C. Command Dispatcher

- Parses incoming commands from user or system
- Maps to appropriate agent or toolchain
- Supports streaming response via async generator

### D. Event Logger

- Stores event logs per user/agent/session
- Secure access policies (user may only see their own)
- Exports in JSONL or NDJSON

---

## V. Security Model

### A. Roles

- `user`, `developer`, `agent`, `admin`

### B. Permissions Matrix

| Action             | User | Developer | Agent | Admin |
| ------------------ | ---- | --------- | ----- | ----- |
| Create agent       | ✅    | ✅         | ❌     | ✅     |
| Restart agent      | ✅    | ✅         | ❌     | ✅     |
| Edit system config | ❌    | ❌         | ❌     | ✅     |
| Upload file        | ✅    | ✅         | ✅     | ✅     |
| Stream prompts     | ✅    | ✅         | ✅     | ✅     |
| View logs          | ✅    | ✅         | ✅     | ✅     |

### C. API Rate Limiting

- JWT fingerprint token required
- 100 req/min soft limit
- 200 req/min hard cap
- Abuse triggers IP rate cap + challenge

---

## VI. Notes for Integration

- Client must keep WebSocket alive with heartbeats
- Each WebSocket should authenticate using JWT in connection URL or payload
- Multipart file uploads supported
- Logs stream via both `/logs` REST and WebSocket
- All streamed data uses `stream_id` and optional correlationId

---

## VII. Future Enhancements

- gRPC-based internal transport for cross-language agent RPC
- GraphQL interface for full schema querying
- Secure event relays for agent-to-agent communication
- CRDT support for collaborative editing
- Federated socket bridges via kLink mesh

---

## 📁 Related Files

- `src/api/routes/`
- `src/api/websockets/`
- `src/core/dispatcher.py`
- `src/core/logger.py`
- `src/core/agent_registry.py`
- `src/core/stream_router.py`


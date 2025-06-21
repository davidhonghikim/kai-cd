# 250: Agent Result Dispatcher (kOS)

## Overview

The **Agent Result Dispatcher** is a centralized service within kOS that efficiently distributes, logs, and routes the results of completed tasks from agent modules to their designated destinations. This component ensures consistent formatting, traceability, and secure delivery across various channels, services, and storage endpoints.

---

## Responsibilities

- Receive structured task output from agents
- Validate result format and metadata
- Route results to destination(s): UI, logs, artifact storage, or third-party services
- Apply any transformation hooks or finalization logic
- Trigger downstream systems or handlers (e.g., notification agents, validators)

---

## Directory Structure

```
kos/
  core/
    dispatcher/
      __init__.py
      result_dispatcher.py
      dispatch_rules.py
      format_validators.py
      destination_router.py
      hooks/
        encryption.py
        transformers.py
      logs/
        dispatcher.log
      config/
        routes.yaml
        validation_schema.json
```

---

## Key Components

### 1. `result_dispatcher.py`

Main entrypoint that exposes a `dispatch(result: AgentResult)` method.

```python
class ResultDispatcher:
    def __init__(self):
        self.routes = load_routes()
        self.validator = ResultValidator()
        self.router = DestinationRouter(self.routes)

    def dispatch(self, result: AgentResult):
        if not self.validator.validate(result):
            raise InvalidResultFormatError(result)

        result = apply_transform_hooks(result)
        self.router.route(result)
```

### 2. `dispatch_rules.py`

Maps agent type, task type, or labels to a dispatch destination.

- Rule-based config: YAML + override via function decorators
- Fallbacks if no route found

### 3. `format_validators.py`

Uses JSON Schema (`validation_schema.json`) to ensure result:

- Has required fields: `id`, `agent_id`, `timestamp`, `type`, `data`, `meta`
- `data` is typed per agent class
- Optional fields: `trace`, `attachments`, `source_doc`

### 4. `destination_router.py`

Implements:

- `route_to_ui()` – sends data via WebSocket
- `route_to_store()` – stores in `artifact_server`
- `route_to_log()` – logs summary in `dispatcher.log`
- `route_to_validator()` – sends output to `ResultVerifier`
- `route_to_hooks()` – sends to user-defined webhooks

---

## Hooks & Transformations

Located in `hooks/`:

- `encryption.py`: AES256 optional output encryption
- `transformers.py`: Markdownify, JSON flatten, data reduction, sanitization

---

## Configuration Files

### `routes.yaml`

```yaml
llm_agent:
  - ui
  - artifact

validator_agent:
  - log
  - validator

media_agent:
  - artifact
  - hooks: ["https://example.com/upload"]
```

### `validation_schema.json`

Enforces contract between agent output and dispatcher expectations. (JSON Schema v7)

---

## Logging

File: `logs/dispatcher.log`

- Timestamp, Agent ID, Route Target, Result ID, Status
- Sample:

```
[2025-06-20 21:52:11] Agent[vision-27] -> UI, Artifact | Result[a87fcb] | Status: OK
```

---

## API Endpoints (optional)

### `POST /api/dispatch`

Accepts a result body (agent task output) and returns dispatch report.

```json
{
  "id": "result-xyz",
  "agent_id": "agent-alpha",
  "timestamp": "2025-06-20T21:50:00Z",
  "type": "text",
  "data": {
    "text": "Hello world"
  },
  "meta": {
    "task_id": "task-123",
    "confidence": 0.91
  }
}
```

---

## Tests

- Unit: Validate dispatch path logic, config parsing, hook application
- Integration: Mocked agent -> Dispatcher -> Artifact Server / UI / Webhooks

---

## Future Additions

- Retry logic & dead-letter queue (Redis, Kafka)
- Streaming mode with backpressure control
- Result deduplication cache
- Per-destination latency and status monitoring

---

## Dependencies

- `pydantic`, `jsonschema`
- `aiohttp` or `FastAPI` (if exposing API)
- `cryptography` (for encrypted output)
- `PyYAML`

---

## Status Indicators

| 🟦 | Step                         | Description               |
| -- | ---------------------------- | ------------------------- |
| 🟩 | Setup directories            | Dispatcher layout created |
| 🟩 | Schema validation            | JSON schema implemented   |
| 🟦 | Result router                | In-progress routing logic |
| ⬜  | Webhook & UI API integration | Not started               |
| ⬜  | Retry + metrics              | Not started               |


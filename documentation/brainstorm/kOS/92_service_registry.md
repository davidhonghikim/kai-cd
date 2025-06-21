# 92: Service & Integration Registry

This document defines the design, functionality, integration strategy, and configuration schema for the centralized Service & Integration Registry within the `kAI` and `kOS` systems. It manages service metadata, connection protocols, authentication flows, dynamic endpoint loading, and integration status tracking.

---

## I. Overview

The Service & Integration Registry acts as the universal connector catalog for all external or internal tools, APIs, and services. It provides declarative, modular definitions to:

- Enable plug-and-play service extensions
- Centralize auth + configuration
- Dynamically render service UIs
- Monitor integration health
- Standardize service discovery across agents

---

## II. Service Definition Format (YAML)

All services are defined using a `service.yaml` spec, loaded into the registry.

```yaml
id: openai
name: OpenAI GPT
category: llm
version: 1.0.0
icon: ./icons/openai.svg

base_url: https://api.openai.com/v1
protocol: https

auth:
  required: true
  method: bearer_token
  credential_key: OPENAI_API_KEY

endpoints:
  - id: models
    path: /models
    method: GET
    type: dynamic
    parser:
      path: data
      id_key: id
      label_key: id

  - id: chat
    path: /chat/completions
    method: POST
    is_streaming: true
    payload:
      model: '{{model}}'
      messages: '{{messages}}'
      temperature: '{{temperature}}'

ui:
  parameters:
    - id: model
      label: Model
      type: select
      source: models
    - id: temperature
      label: Temperature
      type: number
      min: 0
      max: 2
      step: 0.1
      default: 0.7
```

---

## III. Integration Categories

| Category     | Description                         | Examples                              |
| ------------ | ----------------------------------- | ------------------------------------- |
| `llm`        | Large language model APIs            | OpenAI, Anthropic, Ollama             |
| `media`      | Image/audio/video generation tools   | A1111, ComfyUI, TTS engines           |
| `workflow`   | Automation & orchestration           | n8n, Huginn, AutoGen agents           |
| `storage`    | File or vector database              | S3, Qdrant, Chroma                    |
| `security`   | Key management or auth systems       | Vault, JWT, OAuth2                    |
| `infra`      | Infra-level services & APIs          | Grafana, Prometheus, kOS mesh tools   |
| `custom`     | User-defined modules                 | Private APIs, legacy connectors       |

---

## IV. Credential Management

- Credentials stored in Secure Vault (🔒)
- Accessed by `credential_key` at runtime
- Can be rotated without redeploying services

Example:
```yaml
auth:
  required: true
  method: api_key
  credential_key: HUGGINGFACE_TOKEN
```

---

## V. Service Lifecycle

### A. Registration Flow
1. User adds or imports `service.yaml`
2. Schema is validated
3. Required credentials are requested via Vault UI
4. Endpoint health checks are run
5. Service is added to central registry and available to agents

### B. Runtime Use
- Agents query registry for service ID
- Pulls metadata, endpoints, auth method, and UI schema
- Prompts user for input parameters (if needed)
- Makes authorized request using service definition

### C. Dynamic UI Generation
Service parameters are rendered automatically based on `ui.parameters`. Supported types:

- `text`, `number`, `select`, `boolean`, `password`, `textarea`
- `select` can reference `endpoint.id` as data source

---

## VI. Health Check System

| Check               | Frequency | Description                              |
|--------------------|-----------|------------------------------------------|
| Auth Validity      | On load   | Tests if auth token is working           |
| Endpoint Ping      | Daily     | Confirms all `GET` endpoints reachable   |
| Schema Match       | Weekly    | Compares returned fields to definition   |
| Latency Monitor    | On use    | Logs response time for performance stats |

Results are shown in `/services/health` UI tab and agent logs.

---

## VII. Registry Storage Backend

- `registry/definitions/` → raw YAML files
- `registry/index.json` → full service index with hash metadata
- `db.services` → SQL metadata table with sync status and last check

---

## VIII. Examples of Built-In Services

| ID         | Description             | Auth Method     |
|------------|-------------------------|-----------------|
| `openai`   | GPT LLM (chat + models) | Bearer Token    |
| `ollama`   | Local LLM API           | None            |
| `hugface`  | HuggingFace Inference   | API Key         |
| `a1111`    | Stable Diffusion UI     | None            |
| `n8n`      | Automation workflows    | API Key         |
| `vault`    | Secure storage service  | None (internal) |

---

## IX. Future Plans

- GUI for composing new service definitions
- OAuth2 credential flow handling
- Remote service import from KindHub
- Dynamic service override at runtime (proxy switch)

---

### Changelog
– 2025-06-20 • Initial draft of Service & Integration Registry


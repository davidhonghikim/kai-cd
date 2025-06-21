# 213: Modular Agent APIs and Plugin Contracts

## Overview
This document defines the structure, expectations, and lifecycle of Modular Agent APIs and plugins within the `kAI` (Kind AI) and `kOS` (Kind Operating System) ecosystem. Each agent or tool is implemented as a modular service that registers with the system via defined plugin contracts and APIs.

---

## 🔌 Plugin & Agent Architecture

All plugins (agents, services, UI modules, adapters) must follow a standard contract interface:

### Core Contract Fields
```ts
interface AgentPlugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: 'agent' | 'tool' | 'service' | 'middleware' | 'extension';
  entrypoint: string;
  capabilities: CapabilityDescriptor[];
  configSchema?: JSONSchema;
  permissions?: string[];
  init: (env: AgentEnvironment) => Promise<AgentInstance>;
}
```

### Example Capability Descriptor
```ts
interface CapabilityDescriptor {
  id: string;
  type: 'chat' | 'memory' | 'schedule' | 'storage' | 'compute' | 'transform' | 'webhook';
  routes?: RouteDefinition[];
  events?: string[];
  inputs?: string[];
  outputs?: string[];
}
```

### AgentInstance
```ts
interface AgentInstance {
  run: (input: AgentInput) => Promise<AgentOutput>;
  stop?: () => Promise<void>;
  status?: () => Promise<AgentStatus>;
}
```

---

## 🔁 Plugin Lifecycle

| Stage         | Description |
|---------------|-------------|
| `discover()`  | Plugin is identified from manifest or directory. |
| `validate()`  | System verifies plugin metadata, dependencies, schema. |
| `init()`      | Plugin is loaded and initialized. Config passed. |
| `register()`  | Plugin registers capabilities and routes with kAI. |
| `run()`       | Plugin is called during runtime by kAI or another plugin. |
| `destroy()`   | Plugin is unloaded and resources are freed. |


---

## 📁 Directory Structure (Default)

```bash
/plugins
  /memory-agent
    manifest.json
    index.ts
    schema.json
    README.md
  /calendar-scheduler
    manifest.json
    index.ts
```

---

## 🧠 Plugin Registry (example JSON)
```json
{
  "id": "calendar-scheduler",
  "name": "Calendar Scheduler",
  "version": "1.0.0",
  "type": "agent",
  "entrypoint": "index.ts",
  "capabilities": [
    { "id": "schedule", "type": "schedule", "events": ["onNewEvent", "onConflict"] }
  ],
  "permissions": ["calendar.read", "calendar.write"]
}
```

---

## 🔐 Plugin Permission Model

Plugins must declare any permission scopes they require. These are validated by the system and user-approved:

### Standard Scopes
- `calendar.read`
- `calendar.write`
- `memory.read`
- `memory.write`
- `filesystem.access`
- `network.fetch`

Plugins attempting unauthorized access will be sandboxed or blocked.

---

## 🧪 Test Agent Plugin (Example)

```ts
const TestAgent: AgentPlugin = {
  id: 'test-agent',
  name: 'Test Agent',
  version: '0.1.0',
  type: 'agent',
  entrypoint: './main.ts',
  capabilities: [
    { id: 'chat', type: 'chat', inputs: ['text'], outputs: ['text'] },
  ],
  init: async (env) => {
    return {
      run: async (input) => ({ output: `Echo: ${input.text}` })
    };
  },
};
```

---

## 🌐 API Integration Guidelines

Each agent plugin may expose REST, GraphQL, or WebSocket APIs. These must be defined in:
- The `capabilities.routes[]` field
- With OpenAPI-compatible annotations where possible

The system automatically generates route handlers if properly defined in the manifest or decorated with supported annotations.

---

## 📦 Deployment & Distribution

### Local Development
```bash
yarn dev:plugin calendar-scheduler
```

### Publishing Plugin (internal repo or registry)
```bash
kai publish ./plugins/calendar-scheduler
```

---

## 🛡️ Security & Isolation

- All plugins run in isolated workers/threads
- Optional sandboxing via nsjail / Deno isolate / Docker containers
- Plugins cannot access system memory unless declared via permission manifest
- System uses signature validation to ensure plugins are not tampered

---

## 📚 See Also
- `211_Plugin_Specification.md`
- `205_KLP_Protocol_Overview.md`
- `114_Service_Agent_Registry.md`
- `108_Agent_Execution_Runtime.md`

---

### Changelog
– 2025-06-20 • Initial draft


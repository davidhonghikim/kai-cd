# 17: Service Orchestration Hub

This document details the complete architecture, configuration, and implementation of the **kAI Service Orchestration Hub**, the master control and integration layer that manages internal and external services in both kAI (Kind AI) and kOS (Kind OS). It functions as the brainstem that routes requests, resolves dependencies, delegates tasks to agents or third-party services, and tracks the lifecycle of every service call.

---

## I. Purpose

The Service Orchestration Hub (SOH) coordinates all API and system-level service requests across the entire kAI/kOS platform. It also abstracts away implementation details so that frontend or agent-level logic can remain clean and declarative.

---

## II. Core Responsibilities

- Central task dispatching and routing
- Load balancing and concurrency limits
- Cross-agent coordination and delegation
- Retry logic, fallbacks, and error handling
- Access control, credential injection, and security policies
- Logging and telemetry of all service calls

---

## III. Directory Structure

```text
src/
├── core/
│   └── orchestration/
│       ├── index.ts                      # Entry point
│       ├── Orchestrator.ts              # Main router and dispatcher
│       ├── ServiceRegistry.ts           # Keeps track of all available services
│       ├── CredentialInjector.ts        # Injects secrets and tokens per service
│       ├── PolicyEngine.ts              # Enforces ACLs, fallback policies
│       ├── DelegationManager.ts         # Forwards tasks between agents
│       ├── RetryHandler.ts              # Handles retry + exponential backoff
│       └── middleware/
│           ├── metrics.ts               # Logs timing and performance stats
│           ├── auth.ts                  # Auth checks for agent-originated calls
│           └── sanitizer.ts             # Strips unsafe data from inputs
```

---

## IV. Configuration

### `config/orchestration.yaml`

```yaml
retry:
  max_attempts: 3
  delay_strategy: exponential
  base_delay_ms: 200
  jitter: true

policies:
  fallback_on_error: true
  allow_cross_agent: true
  max_parallel_tasks: 5

credential_injection:
  allow_external_vault: false
  auto_load_from_prompt_vault: true

telemetry:
  log_to_file: true
  log_file_path: logs/orchestration.log
  emit_events: true
```

---

## V. Component Details

### A. Orchestrator.ts

Main routing engine:

- Accepts `ServiceRequest` objects
- Validates with `PolicyEngine`
- Injects secrets from `CredentialInjector`
- Calls `RetryHandler` and sends to service
- Returns `ServiceResponse`

### B. ServiceRegistry.ts

- Dynamically loads services from `connectors/definitions`
- Caches endpoint metadata
- Tags each service by type (LLM, media, storage, etc.)

### C. CredentialInjector.ts

- Pulls secrets from the Prompt Vault
- Supports inline and reference-based injection
- Logs credential use (never reveals value)

### D. PolicyEngine.ts

- Reads rules from `orchestration.yaml`
- Enforces access control lists, rate limits, fallback behavior

### E. DelegationManager.ts

- Splits tasks across agents if multiple are active
- Supports task fragmentation and result merging
- Useful for agent groups and CrewAI-style workflows

### F. RetryHandler.ts

- Standardized retry + backoff engine
- Emits retry events for monitoring

### G. Middleware

- `auth.ts`: Rejects calls from unauthenticated agents
- `metrics.ts`: Captures timing, throughput, errors
- `sanitizer.ts`: Validates inputs for XSS, shell injection, SQLi, etc.

---

## VI. API Format

### A. `ServiceRequest`

```ts
interface ServiceRequest {
  agentId: string;
  serviceId: string;
  capability: string;
  endpointId: string;
  parameters: Record<string, any>;
  userId?: string;
  context?: string;
}
```

### B. `ServiceResponse`

```ts
interface ServiceResponse {
  status: 'success' | 'error';
  data?: any;
  error?: string;
  attempts: number;
  timestamps: {
    received: string;
    completed: string;
  };
}
```

---

## VII. Logging & Monitoring

- Logs every request, retry, and result
- Emits traceable request IDs
- Flags degraded services or overloaded agents
- Logs are used for usage analytics, debugging, and billing (future)

---

## VIII. Future Enhancements

| Feature                     | Target Version |
| --------------------------- | -------------- |
| Service Dependency Graph    | v1.1           |
| Remote Agent Proxy Routing  | v1.2           |
| Plugin Hooks for All Stages | v1.3           |
| Service Affinity Scheduler  | v1.4           |
| Real-time UI Dashboards     | v2.0           |

---

### Changelog

- 2025-06-21: Initial full system spec


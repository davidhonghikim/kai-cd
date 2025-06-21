# 144: Agent Ephemeral Context and Session Flow Control

This document defines the design, purpose, and flow mechanics for ephemeral agent contexts and session control in the `kAI` and `kOS` systems. It ensures agents manage short-term memory, temporary state, and interaction scoping in a performant, secure, and leak-free manner.

---

## I. Purpose

- Facilitate temporary, isolated agent sessions
- Enable scoped context without writing to long-term memory
- Support secure in-memory computation for sensitive flows
- Define cleanup, transition, and expiration rules

---

## II. Core Components

### 1. Ephemeral Session Manager (ESM)

- **Role:** Oversees lifecycle of short-lived agent contexts
- **Backends:** In-memory (default), Redis, Volatile SQLite
- **Functions:**
  - Create ephemeral state
  - Track expiration
  - Garbage collect after use

### 2. ContextScope Interface

- Standardized interface for ephemeral memory blocks:

```ts
interface ContextScope {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  context: Record<string, any>;
  locked?: boolean;
  agentId: string;
  ttl: number;
}
```

### 3. TransientMiddleware

- Pluggable middleware for routing ephemeral context
- Injects contextScope into relevant handlers
- Purges or transfers state upon completion

### 4. Context Locking API

- Allows agent to lock ephemeral scope:

```ts
POST /ephemeral/:id/lock
```

- Prevents further mutations until unlock or expiry

### 5. Time-To-Live (TTL) Policy Enforcer

- Config-driven system for:
  - Max session lifetime
  - Max idle time
  - Auto-extension flags
  - Fail-safe destruction

---

## III. Session Flow Types

### A. Stateless Command Sessions

- Triggered by quick interactions
- No state written unless upgraded
- Examples: Quick calculation, fetch, validation task

### B. Stateful Scoped Sessions

- Used for multi-step workflows
- Context preserved for duration of task chain
- Uses `ContextScope`

### C. Secure Temporary Sessions

- Triggered by sensitive agent flows (e.g. crypto signing)
- Isolated runtime
- Auto-locked on completion
- Never persisted

---

## IV. Configuration

### Ephemeral Memory Settings (YAML)

```yaml
ephemeral:
  engine: memory | redis | sqlite
  default_ttl: 600 # seconds
  max_ttl: 3600
  purge_on_error: true
  log_evictions: true
```

---

## V. Integration with Agent Runtime

- TransientMiddleware used in:
  - API request/response cycle
  - Event triggers
  - UI state scaffolding
- SessionManager registered at app boot time
- Agents use ephemeral interface via runtime helper:

```ts
const scope = useEphemeralScope(agentId);
scope.set('taskStatus', 'running');
```

---

## VI. Security Considerations

- In-memory only by default; no persistence
- Zero-write-on-disk policy for secure sessions
- Scope UUIDs include entropy seed
- No cross-scope access
- Eviction logs scrubbed of sensitive data

---

## VII. Cleanup & Expiration

### Garbage Collection (GC)

- Runs at regular interval (default 30s)
- Flags:
  - TTL expired
  - Agent exited
  - Forced purge

### Manual Deletion

```ts
DELETE /ephemeral/:id
```

### Lock-Protected Timeout

- Locked sessions receive extended warning TTL before hard expiry

---

## VIII. Metrics & Observability

- Active ephemeral sessions
- Expired vs evicted count
- Memory usage over time
- Time-to-live heatmap
- Locked scope ratio

---

## IX. Future Enhancements

- Ephemeral file mounts (RAM disk integration)
- WebAssembly scope sandboxing
- Agent-driven TTL policy extensions
- Session-to-chain linking for task chaining

---

### Changelog

- 2025-06-22 • Initial draft with full memory flow and TTL enforcement rules

---

Next planned doc: **145: Inference-Oriented Agent Design (IOAD)**


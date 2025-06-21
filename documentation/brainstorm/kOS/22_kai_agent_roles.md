# 22: kAI Agent Roles and Capabilities

This document defines the complete list of internal kAI (Kind AI) agent roles, responsibilities, capabilities, configurations, communication protocols, and how they interact with other components within kOS (Kind OS). Each agent is a modular and configurable actor in the distributed, human-aligned ecosystem.

---

## I. Agent Definition Schema

All agents follow the Kind Agent Schema (`src/agents/schema/AgentSchema.ts`). Key attributes include:

```ts
interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  permissions: PermissionSchema;
  config: Record<string, any>;
  triggers: TriggerDefinition[];
  comms: CommBinding;
  runtime: RuntimeProfile;
}
```

### Required Supporting Files

- `PermissionSchema.ts` – defines allowed API/module access
- `TriggerDefinition.ts` – event-based, schedule-based, or manual
- `CommBinding.ts` – socket, REST, shared memory, gRPC, pubsub, etc.
- `RuntimeProfile.ts` – isolation level, resource quota, logging profile

---

## II. Core Agent Categories

### A. Interface Agents

Handle interaction with users or external systems.

| Agent ID       | Description                            | Interfaces       |
| -------------- | -------------------------------------- | ---------------- |
| chat\_frontend | Local chat UI or browser extension     | React, WebSocket |
| voice\_control | Wake word + STT + command parsing      | mic input, MQTT  |
| phone\_bridge  | Mobile call/SMS gateway agent          | Twilio, WebRTC   |
| email\_bridge  | Monitors inbox, routes mail            | IMAP, SMTP       |
| io\_overlay    | Screen reader / braille / AR interface | OS APIs, TTS     |

### B. Memory & Knowledge Agents

| Agent ID     | Description                           | Data Sources        |
| ------------ | ------------------------------------- | ------------------- |
| kMemory      | Vector + relational long/short memory | Redis, Qdrant       |
| kIndexer     | Indexes user files and external docs  | local FS, cloud API |
| kSummarizer  | Auto-summarizes long interactions     | LLM, summarizer lib |
| log\_watcher | Watches logs for behavioral patterns  | Loki, Promtail      |

### C. Execution & Utility Agents

| Agent ID        | Description                            | Interfaces       |
| --------------- | -------------------------------------- | ---------------- |
| kScheduler      | Cron + interval + event job system     | Redis, Celery    |
| command\_runner | Executes shell commands/scripts        | sandboxed shell  |
| ui\_renderer    | Graph/plot/image/map/audio rendering   | HTML Canvas, SVG |
| bridge\_agent   | Proxy agent between two modules/agents | WebSocket        |

### D. Privacy & Control Agents

| Agent ID        | Description                           | Security Context |
| --------------- | ------------------------------------- | ---------------- |
| vault\_guard    | Manages access to credentials/secrets | AES, PBKDF2      |
| auth\_sentinel  | Handles auth token validation, MFA    | OAuth2, JWT      |
| data\_sanitizer | Scrubs PII and sensitive outputs      | Regex, LLM       |
| event\_logger   | Audits and logs all actions           | Loki             |

### E. Companion Agents (Roles)

| Agent ID        | Persona Role                    | Customization Options             |
| --------------- | ------------------------------- | --------------------------------- |
| tutor\_agent    | Educational guide               | subject, age level, tone          |
| wellness\_agent | Mental health & lifestyle coach | journaling, mindfulness           |
| concierge       | Travel, food, errands assistant | current location, calendar access |
| caretaker       | Elder/disability assistant      | meds, reminders, check-ins        |

---

## III. Agent Configuration Profiles

All agents use YAML config files (hot-reloaded via kScheduler).

Example: `config/agents/tutor_agent.yaml`

```yaml
persona:
  tone: friendly
  knowledge_scope: math,science,history
  teaching_style: socratic
safety:
  profanity_filter: true
  hallucination_detection: true
limits:
  daily_interactions: 500
  max_tokens_per_response: 2048
runtime:
  isolation: true
  cpu_quota: 1
  memory_quota: 512mb
```

---

## IV. Inter-Agent Communication (KLP)

Kind Link Protocol (KLP) supports:

- direct peer-to-peer (via websocket or grpc)
- event bus (e.g. NATS)
- local socket broadcast (Unix socket or memory buffer)
- secure message envelope (AES, curve25519, optional signature)

Routing table: `config/klp_routes.yaml`

```yaml
routes:
  - source: chat_frontend
    target: tutor_agent
    policy: direct
  - source: command_runner
    target: vault_guard
    policy: authenticated_only
```

---

## V. Agent Lifecycle

1. **Registration:** On boot, all agents register with `kScheduler`
2. **Discovery:** Agents query `klp_routes.yaml` to know who can be reached
3. **Runtime:** Execution triggered by:
   - user interaction
   - event (e.g. new email)
   - schedule (e.g. every 15 min)
4. **Monitoring:** Each agent self-reports health every 30s
5. **Audit Trail:** All inputs/outputs logged with agent ID + timestamp

---

## VI. Security Context

Each agent runs with an isolated config, access permissions, and audit ID.

| Security Layer        | Technique/Tool      |
| --------------------- | ------------------- |
| Sandbox Isolation     | nsjail / Docker     |
| Permission Boundaries | RBAC config schema  |
| Secret Access         | vault\_guard        |
| Audit Trail           | event\_logger, Loki |
| Auth Validation       | auth\_sentinel      |

---

## VII. Future Agent Roles (Proposed)

| Agent ID          | Role Description                     |
| ----------------- | ------------------------------------ |
| home\_auto\_agent | Home assistant (IoT devices)         |
| code\_assistant   | Pair programming & lint suggestions  |
| doc\_curator      | Aggregates & tags documents          |
| digital\_gardener | Content pruning, website mgmt        |
| trust\_oracle     | Validates info & verifies content    |
| media\_host       | AI-powered photo/audio/video gallery |

---

### Changelog

- 2025-06-20: Initial detailed agent catalog and communication model.


# 124: Agent Scheduling and Task Queue Architecture

This document defines the internal architecture of task scheduling, priority queues, timers, cron logic, and inter-agent job delegation within the `kAI` and `kOS` frameworks.

---

## I. Scheduler Overview

Each agent has an embedded scheduler runtime that maintains its own:

- Local task queue
- Priority index
- Timer events
- External job listener (for delegation/receipt)

Schedulers are pluggable and configurable via manifest or runtime commands.

---

## II. Task Format

Each task is defined as a structured object:

```json
{
  "id": "task-f3e1",
  "type": "cron" | "once" | "stream" | "reaction" | "external",
  "run_at": "2025-06-30T12:00:00Z",
  "repeat": "0 */6 * * *",  // optional: cron expression
  "priority": 3,             // 0 = critical, 5 = low
  "action": {
    "module": "SchedulerUnit",
    "function": "trigger_reminder",
    "args": ["meeting with team"]
  },
  "dependencies": ["task-a", "task-b"],
  "tags": ["reminder", "calendar"]
}
```

---

## III. Priority Queuing Logic

The scheduler implements a **multilevel feedback queue** (MLFQ) with:

- **Priority Bands**: 0 (critical), 1 (realtime), 2 (interactive), 3 (default), 4 (idle), 5 (background)
- **Time Slicing**: lower bands receive longer slices
- **Starvation Avoidance**: aging and promotion of background tasks
- **Burst Tracking**: tracks bursty behaviors and adjusts queue placement

---

## IV. Cron & Timers

- **Standard Cron Format** with `cronspec` validator
- Supports timezones via agent locale config
- Timer-based triggers use monotonic clock (safe from clock skew)
- Missed crons (e.g. from offline period) trigger upon next wake if policy is set

---

## V. External Task Delegation

- Agents may register as task producers or consumers
- `KindLink Protocol (klp)` defines the packet for job handoff:

```json
{
  "kind": "klp/task",
  "origin": "agent-a",
  "target": "agent-b",
  "task": { ...task object... },
  "signature": "ecdsa-p256"
}
```

- Tasks are signed, verified, and re-enqueued into the local queue
- Provenance log kept for audit and chain-of-custody

---

## VI. Failure Handling

- Retries with exponential backoff per task type
- Failure hooks can trigger other tasks
- Max attempts set globally or per task
- On persistent failure:
  - Archive task with status `failed`
  - Emit `agent.signal.taskFailure`
  - Optionally notify user or escalate to parent agent

---

## VII. Runtime Commands

Agents may be issued control commands via CLI, WebUI, or mesh command channel:

```sh
kaictl agent.task.add --file ./reminder.json
kaictl agent.task.list
kaictl agent.task.pause --id task-f3e1
kaictl agent.task.resume --id task-f3e1
```

---

## VIII. Scheduler Plugins

Plugins may override:

- Queue discipline (e.g. switch to deadline-based)
- Custom repeat rules
- Remote event stream triggers

Plugins must conform to:

```ts
interface SchedulerPlugin {
  canHandle(task): boolean
  schedule(task): void
  cancel(taskId): void
}
```

---

## IX. Visual Graph Export

Each scheduler can emit a visual DOT or Mermaid flowchart of current task DAG:

```sh
kaictl agent.task.graph --format mermaid
```

---

## X. Security & Trust

- Tasks with elevated privileges must declare `requires_trust: true`
- All cross-agent tasks signed with originating agent key
- No unsigned tasks accepted from external origin
- Job queues can be sandboxed per namespace or capability

---

### Changelog

– 2025-06-20 • Initial scheduler and task queue architecture – 2025-06-21 • Added external delegation support via klp


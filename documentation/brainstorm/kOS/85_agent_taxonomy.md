# 85: Agent Taxonomy & Classification System

This document defines a comprehensive and modular taxonomy system for agents within the `kAI` and `kOS` ecosystems. It enables both the system and the user to identify, categorize, filter, and manage agents based on purpose, capabilities, scope, and trust tier.

---

## I. Taxonomy Schema Overview

Each agent must declare a standardized classification header in its metadata or deployment manifest, as follows:

```yaml
classification:
  domain: [core | utility | knowledge | assistant | governance | control | sensory | automation | creative]
  role: [planner | executor | responder | observer | manager | guide | auditor | sensor | transformer]
  scope: [personal | shared | group | system | global | mesh]
  tier: [0 | 1 | 2 | 3 | 4]  # 0 = Untrusted / 4 = System Root
  capabilities:
    - prompt-processing
    - secure-memory
    - file-access
    - api-calls
    - vector-query
    - realtime
    - decision-making
    - self-update
```

---

## II. Domains (Top-Level Categories)

| Domain      | Description |
|-------------|-------------|
| `core`      | Agents essential to system operation or orchestration.
| `utility`   | Tools providing specific narrow functions or services.
| `knowledge` | Focused on information retrieval, fact-checking, summaries.
| `assistant` | Direct user helpers (daily planner, writer, tutor).
| `governance`| Policy, moderation, rule enforcement, quorum coordination.
| `control`   | System-level actuators or hardware interface agents.
| `sensory`   | Data acquisition agents (sensors, scrapers, surveillance).
| `automation`| Task runners, schedulers, CI/CD, deployment assistants.
| `creative`  | Art, code, writing, music, media synthesis agents.

---

## III. Roles (Functional Archetypes)

| Role       | Description |
|------------|-------------|
| `planner`   | Proposes multi-step plans or decisions.
| `executor`  | Carries out actions proposed by planner or user.
| `responder` | Responds to events, messages, or user input.
| `observer`  | Monitors systems, states, and logs.
| `manager`   | Orchestrates other agents or services.
| `guide`     | Supports the user with tutorials or context.
| `auditor`   | Analyzes logs, changes, or anomalies.
| `sensor`    | Ingests external data or stimuli.
| `transformer`| Converts formats, languages, or schemas.

---

## IV. Scope Levels

| Scope    | Description |
|----------|-------------|
| `personal` | Only serves and stores state for the current user.
| `shared`   | Accessible to multiple users but not publicly indexed.
| `group`    | Used in team contexts or secure collaborations.
| `system`   | Embedded into infrastructure-wide services.
| `global`   | Public services, exposed APIs, discoverable.
| `mesh`     | Participates in distributed or P2P networks.

---

## V. Trust Tiers

| Tier | Meaning |
|------|---------|
| `0`  | Unverified / sandboxed / minimal privileges
| `1`  | Verified, non-privileged helpers
| `2`  | Trusted by user or administrator
| `3`  | Elevated trust, can access user/system configs
| `4`  | Root agents with total access/control (used carefully)

---

## VI. Capabilities Ontology

These are machine-readable flags used by orchestrators and interfaces:

- `prompt-processing` — Can parse/interpret prompt input
- `secure-memory` — Has secure persistent storage
- `file-access` — Can read/write to designated filesystem paths
- `api-calls` — Can make external API requests
- `vector-query` — Can use vector databases or embedding systems
- `realtime` — Can respond to realtime events or streams
- `decision-making` — Has internal reasoning or routing ability
- `self-update` — Can modify or upgrade itself (only Tier 3+)

---

## VII. Example Classification Entries

### Example 1: Daily Planner Agent
```yaml
classification:
  domain: assistant
  role: planner
  scope: personal
  tier: 2
  capabilities:
    - prompt-processing
    - secure-memory
    - decision-making
```

### Example 2: System Log Auditor
```yaml
classification:
  domain: governance
  role: auditor
  scope: system
  tier: 3
  capabilities:
    - file-access
    - prompt-processing
    - decision-making
```

---

## VIII. Future Work

- Dynamic classification overrides based on context
- Distributed taxonomic discovery for mesh agents
- Integration with agent trust system

---

### Changelog
– 2025-06-20 • Initial taxonomy framework drafted


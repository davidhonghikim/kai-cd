# 71: PromptKind – Unified Prompt Manager Specification

This document defines the architecture, functionality, and protocol interfaces for the `PromptKind` module—the unified prompt manager system for both `kAI` and `kOS`. It handles creation, validation, sharing, injection, and lifecycle management of prompts across user agents, workflows, and services.

---

## I. Purpose

PromptKind provides the standardized interface and infrastructure for:

- Persistent, structured prompt libraries
- Safe, consistent prompt injection across agents
- Prompt templating and dynamic slot injection
- Prompt evaluation and ranking tools
- Prompt lifecycle audit logs
- Secure sharing and reuse across agents and users

---

## II. Directory Structure

```text
src/
└── promptkind/
    ├── core/
    │   ├── PromptTemplate.ts           # Template format and slot logic
    │   ├── PromptLibrary.ts            # Local and synced prompt store
    │   ├── PromptExecutionEngine.ts   # Runtime injection engine
    │   └── PromptAudit.ts               # Prompt invocation logs
    ├── ui/
    │   ├── PromptEditor.tsx            # Rich editor component (frontend)
    │   └── PromptBrowser.tsx           # Searchable library interface
    ├── services/
    │   ├── PromptSyncService.ts       # Remote sync with `PromptSync`
    │   ├── PromptShare.ts              # Secure prompt sharing wrapper
    │   └── PromptRanking.ts            # Runtime prompt feedback and scoring
    └── types/
        └── PromptTypes.ts               # Schema and validation types
```

---

## III. Prompt Template Format

Templates use double-brace `{{slot}}` syntax and support metadata annotations:

```json
{
  "id": "goal-setting-v1",
  "title": "Goal Setting Prompt",
  "description": "Prompt for helping user define a SMART goal",
  "template": "Please help the user create a SMART goal for {{goal_topic}}.",
  "slots": ["goal_topic"],
  "tags": ["coaching", "planning"],
  "owner": "agent:planner",
  "auditable": true
}
```

---

## IV. Capabilities

| Feature                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| Prompt Templating       | Templates with required slots, defaults, conditions        |
| Prompt Injection        | Injected into agent context or model call chain            |
| Prompt Library          | Tagged, filterable, versioned                              |
| Sharing & Import/Export | Signed bundles for agent-to-agent or user-to-user transfer |
| Lifecycle Logging       | Logs which agent invoked which prompt, when, and how       |
| Ranking & Feedback      | Prompts can be scored post-hoc or in-session               |
| Chainable Prompts       | Supports sequences and branching (multi-step workflows)    |

---

## V. Integration Points

- Agents call `PromptExecutionEngine.run(promptId, context)`
- Prompts injected into Langchain/LLM chain as prefix or suffix
- Sharing uses signed export via `PromptShare`
- Ranking integrated with feedback UI and agent logs

---

## VI. PromptKindSync Protocol

PromptKindSync is a mini-protocol that allows prompt syncing between agents and between a user and their cloud vault:

```ts
interface PromptSyncPacket {
  promptId: string;
  version: string;
  promptJSON: object;
  signature: string;
  timestamp: string;
  source: DID;
  target: DID;
}
```

---

## VII. Security Features

- **Prompt Hashing** for tamper verification
- **Slot Constraints** to prevent prompt injection attacks
- **Audit Trail** with redacted sensitive values
- **Owner Signing** for trusted source verification
- **Prompt Locking** (read-only flags)

---

## VIII. UI Components

- PromptKindEditor: Full template editing with live preview
- PromptKindLibrary: Searchable and filterable UI
- PromptStatsPanel: Success rates, usage logs, rankings

---

## IX. Example Prompt Lifecycle

1. User creates prompt `p1` using PromptEditor
2. `p1` saved to `PromptLibrary`
3. Agent `GoalPlanner` calls `run('p1', { goal_topic: 'exercise' })`
4. Prompt injected into chain as prefix
5. On complete, feedback form triggers `PromptRanking`
6. Stats updated in `PromptAudit`
7. User shares prompt with their friend via `PromptShare`

---

## X. Roadmap

| Feature                          | Status   |
| -------------------------------- | -------- |
| Visual Prompt Chaining UI        | Planned  |
| Prompt Auto-Ranking via Model    | Planned  |
| Git-based Prompt Version Control | Planned  |
| Prompt Marketplace               | Future   |
| Prompt Linting Rules Engine      | Drafting |

---

### Changelog

- 2025-06-20 • Initial full specification for PromptKind


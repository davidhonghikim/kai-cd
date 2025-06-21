# 109: Prompt Management System (Registry, Versioning, Contextualization)

This document outlines the full architecture, APIs, file structure, and security model of the Prompt Management System within the kAI/kOS ecosystem.

---

## I. Overview

The Prompt Management System (PMS) is responsible for handling all prompt lifecycle operations, including:
- Version control
- User and system-level prompt registries
- Prompt tagging and metadata
- Contextual prompt inheritance
- Prompt rendering and injection pipelines

It ensures consistent prompt usage across all agents, preserving history, usage context, and audit trails.

---

## II. Directory Structure

```text
/core/prompt_manager/
├── __init__.py
├── registry/
│   ├── user_registry.json
│   ├── system_registry.json
│   ├── prompt_index.json
│   └── cache/
├── api/
│   ├── routes.py
│   ├── schemas.py
│   └── handlers.py
├── versioning/
│   ├── diff.py
│   ├── merge.py
│   ├── git_driver.py
├── context/
│   ├── resolver.py
│   └── metadata.py
├── engine/
│   ├── render.py
│   ├── inject.py
│   └── formatter.py
├── config.yaml
└── README.md
```

---

## III. Prompt Object Schema

```json
{
  "id": "agent_intro_01",
  "label": "Agent Introduction",
  "content": "You are a helpful assistant...",
  "tags": ["greeting", "default"],
  "type": "system|user|instruction",
  "created_at": "2025-06-21T14:22:00Z",
  "updated_at": "2025-06-21T14:25:00Z",
  "contextual_scopes": ["agent:planner", "agent:kai"],
  "versions": [
    {
      "timestamp": "2025-06-21T14:22:00Z",
      "hash": "c0ffee...",
      "diff": "added greeting phrase"
    }
  ]
}
```

---

## IV. Prompt Registry (System/User)

Each registry is a JSON or YAML file with the following layout:

```yaml
- id: agent_intro_01
  label: Agent Introduction
  path: /core/prompts/agent_intro_01.txt
  type: system
  version: 3
  hash: abc123
  scope: agent:planner
```

---

## V. Prompt Versioning Engine

### A. Backend
- Git-backed file versioning (`git_driver.py`)
- Inline JSON patch tracking for diffs
- Merge conflict resolver with visual diff output

### B. Metadata
- `metadata.py` stores version history with SHA256 commit hashes
- Stores change reasons, user identity, time, and parent hashes

---

## VI. APIs

### `GET /api/prompts`
Returns all prompts visible to the user by scope.

### `POST /api/prompts`
Adds a new prompt or updates an existing one.

### `GET /api/prompts/{id}`
Returns full history and metadata of a prompt.

### `POST /api/prompts/{id}/version`
Creates a new version with diff summary.

### `GET /api/prompts/{id}/render`
Returns compiled prompt ready for injection.

---

## VII. Contextualization Layer

### `resolver.py`
- Loads current environment variables (agent ID, user mode, task type)
- Matches against `contextual_scopes`
- Returns ordered prompt stack by specificity

---

## VIII. Injection Pipeline

### `inject.py`
- Performs prompt macro expansion (e.g., `{{user.name}}`)
- Resolves scope-specific modifiers
- Converts final prompt into tokenized payload for engine

### `render.py`
- Merges multiple prompts into a single resolved string
- Applies formatting options (indent, color codes, markdown)
- Outputs prompt preview for debug display

---

## IX. Security & Audit

- Every prompt change is logged with timestamp and user ID
- SHA-256 digests for immutability checks
- Optionally sign prompt packages with PGP
- Admin tools to audit prompt usage frequency and risk levels

---

## X. UI/UX Integration

- Visual prompt tree and diff viewer in Dev Tools
- Drag-and-drop prompt reordering
- Tag browser for quick filter and navigation
- Prompt test bench UI for live evaluation against simulated agents

---

### Changelog
– 2025-06-21 • Initial detailed blueprint for prompt registry and rendering system


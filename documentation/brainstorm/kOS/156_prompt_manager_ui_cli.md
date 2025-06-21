# 156: Prompt Manager UI/CLI & Permissions System

This document defines the architecture, interface, and permission control logic for the Prompt Manager used in `kAI` and `kOS`. The Prompt Manager is the centralized subsystem for creating, organizing, securing, and distributing prompt templates across local agents, services, and users.

---

## I. Overview

The Prompt Manager consists of:

- A graphical **Prompt UI Editor**
- A programmatic **Prompt CLI Interface**
- A structured **Prompt Registry**
- A granular **Permissions Layer** for role-based prompt access

It enables:

- Creating new prompt templates
- Tagging, versioning, and categorizing prompts
- Granting or restricting prompt use to users or agents
- Reviewing historical changes and rollback

---

## II. Directory Layout

```bash
/prompt_manager/
├── registry/
│   ├── templates/
│   │   ├── system/
│   │   ├── tasks/
│   │   ├── agents/
│   │   ├── debug/
│   │   └── examples/
│   └── index.json
├── cli/
│   └── promptctl.py
├── ui/
│   └── PromptManagerView.tsx
├── permissions/
│   ├── acl.yaml
│   └── roles.json
└── logs/
    └── history.jsonl
```

---

## III. Prompt Template Schema

```json
{
  "id": "summarize-doc-1",
  "name": "Document Summarizer",
  "tags": ["summarization", "nlp"],
  "created_by": "admin",
  "last_modified": "2025-06-20T14:31:00Z",
  "language": "en",
  "prompt": "You are a helpful assistant. Summarize the following: {{input_text}}",
  "version": 3,
  "history": [
    {"version": 1, "modified_by": "admin", "timestamp": "..." },
    {"version": 2, "modified_by": "agent-003", "timestamp": "..." }
  ]
}
```

---

## IV. Prompt Permissions Model

### Roles

```json
{
  "admin": {"read": true, "write": true, "delete": true, "assign": true},
  "maintainer": {"read": true, "write": true},
  "agent": {"read": true},
  "guest": {"read": false}
}
```

### ACL Example (YAML)

```yaml
summarize-doc-1:
  - subject: user:alice
    role: maintainer
  - subject: agent:agent-003
    role: agent
  - subject: group:devs
    role: admin
```

---

## V. UI: PromptManagerView\.tsx

### Features

- Create/Edit/Delete Prompt
- View prompt history & rollback
- Assign roles to users/agents/groups
- Tag-based filtering
- Search and bulk update

### Layout Structure

- Sidebar: prompt categories
- Main panel:
  - Prompt code editor
  - Metadata fields
  - History tab
  - Permissions tab

---

## VI. CLI: promptctl.py

### Commands

```bash
promptctl list --tag summarization
promptctl get summarize-doc-1
promptctl create --file new_prompt.json
promptctl assign --id summarize-doc-1 --subject agent:agent-007 --role agent
promptctl rollback --id summarize-doc-1 --version 2
```

---

## VII. Logging and History

- All changes recorded in `logs/history.jsonl`
- Immutable audit trail with timestamps, subject, and diff summary
- Supports revert and chain-of-custody verification

---

## VIII. Sync and Integration

- kOS registry syncs prompt metadata via KLP protocol
- Optional agent-specific override layer for private prompts
- Prompts can be imported/exported via CLI or UI in JSON format

---

## IX. Security Considerations

- All prompt templates signed on creation (HMAC-based signature)
- ACL enforced at runtime by service wrappers and UI layer
- Agents can only use prompts with read access + signature match

---

## X. Future Features

- Version comparison diff viewer
- Prompt performance telemetry aggregation
- Multi-language prompt variants
- Prompt linting and scoring (LLM-based)

---

### Changelog

– 2025-06-21 • Initial low-level design of Prompt Manager UI/CLI system


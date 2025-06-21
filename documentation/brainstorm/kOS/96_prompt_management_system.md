# 96: Prompt Management System

This document outlines the complete architecture, storage format, lifecycle, and integration approach for the centralized and distributed prompt management system used across `kAI` and `kOS` environments.

---

## I. Core Goals

- Centralize all prompt templates, modifiers, and agent instructions.
- Provide decentralized fallback caching and syncing.
- Support multiple prompt variants per service, task, and context.
- Enable auditing, history, rollback, and differential tuning.
- Embed security constraints and privacy policies within prompts.

---

## II. Prompt Types

| Type              | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `instructional`   | System-level role directives for agents                                 |
| `template`        | User-editable base prompt templates for reuse                           |
| `modifier`        | Additive or override snippets (e.g., tone, domain, length preferences)  |
| `system_overrides`| Admin-level security- or safety-enforced injections                     |
| `contextualized`  | Final assembled prompt for submission                                   |

---

## III. Prompt Lifecycle

### A. Authoring & Publishing

1. Created in `PromptLab` interface or `yaml`/`json` source files
2. Validated against schema:
   - Variables defined and scoped
   - No missing references
   - Secure if override requested
3. Versioned and committed to prompt repository
4. Assigned UID and metadata

### B. Runtime Resolution Flow

1. Agent receives task with prompt_ref
2. Pulls from `PromptResolver`:
   - Base template (by UID)
   - Any attached modifiers (per session/user/profile)
   - Global/system overrides (safety, regulation)
3. Interpolates variables (`{{user_name}}`, `{{input}}`)
4. Logs and hashes final assembled prompt
5. Dispatches prompt to model

---

## IV. File Format & Storage

```yaml
uid: chat_reflective_v1
version: 1.2.0
kind: template
scope: universal
metadata:
  author: system
  created: 2025-06-18T12:22:00Z
  tags: [chat, self-reflection, psychological]
variables:
  - user_name
  - input
content: |
  Hello {{user_name}}, let’s take a moment to reflect.
  Based on what you just shared: {{input}}, how do you feel this aligns with your goals?
```

### Supported Formats
- YAML (.prompt.yaml)
- JSON (.prompt.json)
- Markdown w/ Frontmatter (.md)

### Metadata Index
- Stored in Redis for fast lookup
- Hashed in Qdrant vector cache for semantic search

---

## V. Access Control & Trust Model

- `Read`: Based on agent scope, user tier, service contract
- `Write`: Locked unless explicitly owned or granted
- `Override`: Requires `PromptOverrideCapability`
- Signed edits required for system/global prompts

### Signature Structure (Ed25519)
```json
{
  "uid": "chat_reflective_v1",
  "version": "1.2.0",
  "sig": "b61fa4...",
  "editor": "agent-core-002"
}
```

---

## VI. Tooling & Interfaces

### Prompt Manager UI
- List, filter, preview
- Compare versions side-by-side
- Inline edit and test window
- Clone and variant creator

### CLI
```bash
kai prompts list
kai prompts edit chat_reflective_v1
kai prompts diff chat_reflective_v1@1.1.0 chat_reflective_v1@1.2.0
```

---

## VII. Prompt Injection Security

- System tags enforce `non-editable`, `mask-variables`, `read-only`
- All prompts sanitized via AST-level parser (block HTML/script)
- Prompts signed + verified before execution
- Escaping and input guards on `{{ }}` interpolation
- Logs stored hashed + compressed (Zstd + BLAKE3)

---

## VIII. Distribution & Sync

- Central store: PostgreSQL + Redis + Qdrant
- Local fallback: SQLite + IndexedDB (kAI)
- Sync: via KindLink Protocol push/pull
- Offline agents queue updates for retry
- Vector indexes updated async per change

---

## IX. Prompt Governance & Change Review

- Any prompt affecting public/critical logic must:
  - Be reviewed by quorum of maintainers
  - Pass automated test evaluation
  - Maintain semantic changelog

---

## X. Example Prompt Assembly

```text
1. Base: "You're a helpful assistant..."
2. Modifiers:
   - tone: "speak like a pirate"
   - domain: "legal"
3. System override: "never mention politics"
4. Interpolation:
   {{user_name}} = "Alex"
   {{input}} = "I'm feeling overwhelmed"
5. Final:
   "Arrr, matey Alex. Ye say you're feelin’ overwhelmed. But this be a legal matter, so let's navigate it like old salts. (And no politics allowed!)"
```

---

## XI. Future Features

- Visual prompt lineage graph
- GPT-eval assisted prompt scoring
- Language variant auto-generation
- Prompt sandbox execution runner

---

### Changelog
– 2025-06-21 • Initial full draft of prompt system architecture


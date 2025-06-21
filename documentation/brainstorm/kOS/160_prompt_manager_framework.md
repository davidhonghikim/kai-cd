# 160: Prompt Manager Framework

This document defines the design and implementation of the Prompt Manager system for `kAI` and `kOS`. It handles all aspects of prompt lifecycle management, security, injection resistance, versioning, and role-based transformations.

---

## I. Goals

- Centralized, reusable prompt registry across agents
- Secure prompt composition pipeline with validation & sanitization
- Persistent versioning and history for every prompt change
- Context-layered transformation for multi-role, multi-model operation
- Integration with developer and user-facing prompt editors

---

## II. Directory Structure

```
kos-core/
└── prompt_manager/
    ├── __init__.py
    ├── registry.py           # Prompt registry and CRUD operations
    ├── transformer.py        # Handles dynamic injection and role transformations
    ├── sanitizer.py          # Validates and strips insecure or malformed prompts
    ├── history.py            # Prompt versioning and rollback
    ├── presets/
    │   ├── default_user.json
    │   ├── default_dev.json
    │   └── secure_bot.json
    └── tests/
        ├── test_registry.py
        ├── test_transformer.py
        └── test_sanitizer.py
```

---

## III. Prompt Registry

### Format Example

```json
{
  "id": "core_chat_assistant",
  "version": 4,
  "last_updated": "2025-06-22T04:00:00Z",
  "content": "You are a helpful assistant who...",
  "roles": ["chat", "summarizer"],
  "tags": ["core", "default", "v4"]
}
```

### API

```ts
PromptManager.register(promptId, content, roles[], tags[])
PromptManager.update(promptId, newContent)
PromptManager.get(promptId)
PromptManager.rollback(promptId, version)
PromptManager.list(filters)
```

---

## IV. Transformer Engine

### Core Features

- **Dynamic Interpolation:** `{{agent_name}}`, `{{user_intent}}`, `{{tool_names}}`
- **Role Adapters:** Appends role-specific instructions (e.g., summarizer vs researcher)
- **Context Inheritance:** Carries context and memory forward across turns
- **Injection Defense:** Applies tokenizer-aware heuristic checks

### Sample Output

```ts
PromptTransformer.transform("core_chat_assistant", {
  agent_name: "Kai", user_intent: "summarize notes"
})
```

---

## V. Sanitization Layer

### Actions:

- Strip known prompt injection patterns
- Normalize token separators
- Cap max tokens per template
- Deny dangerous directives (e.g., jailbreaks, impersonation)

### Configurable Ruleset

```yaml
sanitizer:
  max_tokens: 2048
  deny_patterns:
    - "ignore previous instructions"
    - "you are not an AI"
  strip_urls: true
  allowed_markdown: ["**", "_", "[link]()"]
```

---

## VI. Versioning & History

- Stores every change with:
  - Timestamp
  - Diff summary
  - Agent/editor info
- Exposed as:
  - Version list API
  - Git-style diff viewer (for UI)

---

## VII. Integration Points

- `agent-core`: Default prompts loaded via `PromptManager.get()`
- `kCD frontend`: Editable prompt profiles per agent/service
- `Vault`: Private custom prompts stored encrypted
- `DevTools`: Version visualizer and prompt preview

---

## VIII. UI Schema (JSON)

```json
{
  "fields": [
    {"type": "text", "label": "Prompt ID", "bind": "id"},
    {"type": "textarea", "label": "Prompt Content", "bind": "content"},
    {"type": "tags", "label": "Roles", "bind": "roles"},
    {"type": "tags", "label": "Tags", "bind": "tags"}
  ]
}
```

---

## IX. Security Model

- Signed prompt configs (Ed25519 signature over hash)
- Read-only mode for system agents
- Vault binding for sensitive roles (e.g., legal, health)
- Tamper detection via `prompt_hash` tracking

---

## X. Future Extensions

- RAG prompt planning + assembly (multi-part chaining)
- Feedback-driven prompt mutation (via AFIL loop)
- Meta-prompting: agents rewrite each other's prompts
- Prompt scoring via UX metrics

---

### Changelog

– 2025-06-22 • Initial framework draft for full lifecycle prompt system


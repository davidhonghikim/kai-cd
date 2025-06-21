# 111: Prompt Manager Architecture and Standardization

This document defines the prompt management system for `kAI` and `kOS`, including structure, configuration, storage, rendering logic, and compatibility protocols. The Prompt Manager (PM) serves as a central service to standardize, resolve, and dispatch prompts between agents, users, and external services.

---

## I. Purpose

- Provide **modular prompt templating** for reuse and consistency.
- Support **contextual injection**, persona adaptation, and function chaining.
- Track prompt history, mutations, versions, and semantic metadata.
- Enable prompt execution across diverse models and modalities.

---

## II. Prompt Types

| Type            | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| `system`        | Role or initialization prompts (e.g., "You are a helpful agent...") |
| `instruction`   | Task-specific commands or action prompts                            |
| `contextual`    | Information for grounding or memory injection                       |
| `function_call` | Agent-to-agent or agent-to-function invocation                      |
| `template`      | Abstract prompt structures for programmatic reuse                   |
| `persona`       | Core behavioral and speech style scaffolding                        |
| `chain_step`    | Composable prompt block in a larger logic pipeline                  |

---

## III. File & Directory Structure

```
kai-core/
└── prompts/
    ├── templates/
    │   ├── general/
    │   │   ├── default_system.md
    │   │   └── memory_update.md
    │   ├── task/
    │   │   ├── file_summarize.md
    │   │   └── refactor_code.md
    │   └── agent/
    │       ├── planner_start.md
    │       └── chain_builder.md
    ├── personas/
    │   ├── default.yaml
    │   └── cheerful_assistant.yaml
    ├── chains/
    │   └── dev_workflow.json
    ├── registry.yaml
    └── render_engine.ts
```

---

## IV. Prompt Configuration Format

```yaml
id: file_summarize
version: 1.1.0
description: "Summarizes uploaded source files with structural reasoning."
type: instruction
tags: [summarize, file, dev]
model_targets: [gpt-4, claude-3-opus]
inputs:
  - name: file_text
    type: text
  - name: language
    type: enum
    options: ["python", "javascript", "typescript"]

template: |
  Summarize the following {{language}} code:
  ---
  {{file_text}}
  ---
  Provide a 5-line explanation.
```

---

## V. Prompt Registry Spec

Each prompt must be listed in `prompts/registry.yaml`:

```yaml
- id: file_summarize
  path: templates/task/file_summarize.md
  type: instruction
  default_model: gpt-4
  version: 1.1.0
  inputs:
    file_text: text
    language: enum
```

---

## VI. Render Engine Logic (render\_engine.ts)

### Responsibilities

- Load and parse prompt templates
- Validate input keys and types
- Apply default parameters from persona/context
- Render final prompt string with substitutions
- Cache rendered prompts with hash signature

### Excerpt:

```ts
function renderPrompt(id: string, inputs: Record<string, any>): string {
  const template = loadTemplate(id);
  validateInputs(template, inputs);
  const result = applySubstitutions(template.template, inputs);
  return result;
}
```

---

## VII. Prompt Versioning and Hashing

- Each prompt is versioned (SemVer)
- On render, a SHA-256 hash of the filled prompt is stored for traceability
- Mutations are logged in `prompt-history.db` with agent + user ID

---

## VIII. Prompt Storage Options

| Layer        | Type             | Storage        | Purpose                             |
| ------------ | ---------------- | -------------- | ----------------------------------- |
| Source       | Markdown/YAML    | Filesystem     | Human-editable source               |
| Render Cache | SQLite / Redis   | In-memory / fs | Fast lookups for rendered prompts   |
| Version Log  | SQLite + Archive | Persistent     | History of changes and versions     |
| Central Sync | S3 / Git / Vault | Cloud-based    | Sync across distributed agent nodes |

---

## IX. Prompt-to-Intent Resolution

- Prompts are mapped to system `intents`
- Prompt Engine receives a `ResolvedIntent` → fetches associated prompt
- Example:

```ts
intent: "summarize_code"
→ prompt_id: "file_summarize"
→ final_prompt = renderPrompt("file_summarize", {file_text, language})
```

---

## X. Future Enhancements

- Multi-language prompt sets
- Persona-driven tone overlays
- Prompt compiler (intermediate DSL → LLM target)
- Prompt linting / unit testing framework
- Diff tool for prompt version changes

---

### Changelog

– 2025-06-21 • Initial full prompt manager architecture draft


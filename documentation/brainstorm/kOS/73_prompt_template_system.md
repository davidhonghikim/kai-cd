# 73: Prompt Template System

This document defines the architecture, schema, storage, validation, and lifecycle management for prompts and prompt templates used throughout the `kAI` and `kOS` systems. It ensures consistency, reusability, localization, and security for all prompt interactions.

---

## I. Purpose

- Standardize prompt structure for all AI communication
- Support multi-agent chaining and reuse of prompt logic
- Enable localization, customization, and user overrides
- Provide tooling for testing, validation, and fallback logic

---

## II. Core Concepts

### A. Prompt Template
A structured, parameterized prompt format used by agents, services, or workflows.

### B. Prompt Instance
A resolved, runtime-filled prompt ready to be submitted to an LLM.

### C. Prompt Store
Central or distributed storage of all prompt templates, versioned and auditable.

### D. Prompt Bundle
A collection of related prompts (e.g., for onboarding, diagnostics, UI translation, etc.)

---

## III. Directory Layout (`/services/prompts/`)

```bash
/services/prompts/
├── system/
│   ├── error_handling.json
│   ├── onboarding.json
│   └── fallback.json
├── agents/
│   ├── planner_agent.json
│   └── memory_agent.json
├── workflows/
│   ├── creative_writing.json
│   └── research_chain.json
├── bundles/
│   ├── ui_localization.en.json
│   └── diagnostics_bundle.json
└── validators/
    └── schema.prompts.json
```

---

## IV. Prompt Template Schema (JSON)

```json
{
  "id": "planner_agent:weekly_summary",
  "description": "Prompt for summarizing weekly goals",
  "language": "en",
  "audience": "agent",
  "version": "1.0.0",
  "template": "Summarize the user's completed and pending goals for this week:",
  "parameters": [
    {"name": "completed", "type": "string"},
    {"name": "pending", "type": "string"}
  ],
  "style": "concise",
  "tone": "neutral",
  "safety": {
    "max_tokens": 256,
    "temperature": 0.3,
    "moderation": true
  },
  "tags": ["summary", "goals", "weekly"]
}
```

### Schema Notes
- `parameters`: Defines injectable slots for dynamic prompt creation
- `style`, `tone`: Can be interpreted by persona modules
- `safety`: Runtime guardrails and moderation hints
- `language`: Used for localization

---

## V. Prompt Rendering System

### In `kAI`
- Dynamic parameter injection from agent memory or runtime context
- Resolved with Handlebars.js-style template engine
- Supports nested prompts (e.g., `{{render('system:fallback')}}`)

### In `kOS`
- Optional override via system policy or user preference
- Multi-language support using fallback tree: `locale > default > en`

---

## VI. Prompt Versioning

### Semver format: `1.2.0`
- MAJOR: Breaking structure or meaning change
- MINOR: Safe improvements or additional optional fields
- PATCH: Minor fixes or metadata tweaks

All changes must be committed with:
- diff summary
- automated schema validation
- audit log entry

---

## VII. Prompt Loader

### Functions:
- Load by ID (e.g., `system.fallback`)
- Load bundle (e.g., all UI localization strings)
- Validate on load against schema
- Resolve dynamic tokens on request (e.g., current time, user agent)

---

## VIII. Prompt Registry API (Internal FastAPI Service)

### Endpoints
- `GET /prompts/{id}` — Retrieve resolved or raw template
- `POST /prompts/render` — Submit JSON with parameters, return resolved string
- `GET /prompts/search?tag=summary` — Search by metadata
- `GET /prompts/bundle/{name}` — Return all prompts in a bundle

---

## IX. Security and Moderation

- All prompts validated via schema before registration
- Max token + temperature limits enforced at render time
- Unsafe content filtering pre- and post-LLM response
- Restricted prompt sets for untrusted agents

---

## X. Prompt Testing and Development Tools

Tools provided via the developer console (`/dev/promptlab`):

- Prompt sandbox with preview and test parameters
- LLM injection simulation
- Side-by-side render testing
- Export to agent's prompt store

---

### Changelog
– 2025-06-21 • Initial schema and system definition by core agent


# 10: Prompt Manager Design and System Integration

This document provides a complete technical specification for the Prompt Manager subsystem of kindAI (kAI) and kindOS (kOS). The Prompt Manager is responsible for prompt lifecycle management, agent prompt conditioning, context injection, dynamic prompt synthesis, prompt security, and prompt history auditing.

---

## I. Purpose and Scope

The Prompt Manager acts as a central hub for prompt-related logic:

- Stores and versions prompts.
- Dynamically constructs composite prompts based on task, persona, and system configuration.
- Applies security filters and compliance checks.
- Injects relevant memory/context.
- Serves prompts to local and remote agents via API or file mounts.

---

## II. Directory Structure

```text
src/
└── core/
    └── prompt/
        ├── PromptStore.ts              # Central store for prompt records
        ├── PromptCompiler.ts          # Logic for building final prompts from templates
        ├── PromptValidator.ts         # Sanity checks, PII scrub, policy filters
        ├── PromptTransformer.ts       # Context injection, summarization, translation
        ├── PromptRouter.ts            # Routes prompt requests to correct subsystem
        ├── PromptAccessLog.ts         # Tracks prompt usage and agent access
        └── templates/
            ├── default_persona.md     # Base persona template
            ├── system_guidelines.md   # kAI system policy preamble
            └── task_templates/
                ├── summarizer.md
                ├── codegen.md
                └── translator.md
```

---

## III. Prompt Data Model

```ts
interface PromptRecord {
  id: string;
  name: string;
  type: 'system' | 'persona' | 'task' | 'chain';
  tags: string[];
  body: string;
  version: number;
  createdAt: string;
  modifiedAt: string;
  isProtected: boolean;
  linkedTasks?: string[];
  language?: string;
}
```

Stored in: `db/prompt_store.db` (SQLite or Postgres, configurable)

---

## IV. Prompt Composition Pipeline

### A. Steps
1. Agent triggers task (e.g. `summarize_research`)
2. `PromptRouter` selects matching base prompt(s)
3. `PromptCompiler` assembles:
    - System policies
    - Persona tone
    - Task-specific template
    - Injected memory chunks or prior context
4. `PromptValidator` checks for:
    - Length limits
    - Harmful content
    - PII leaks
    - Policy violations
5. Final prompt handed off to requesting agent

### B. Caching
- Composed prompts are cached with checksum hash keys
- Hot reloadable via `SIGUSR1` or API `/reload_prompts`

---

## V. Context Injection Engine

- Pulls memory embeddings from kMemory subsystem
- Injects prior messages, related documents, or relevant facts
- Applies summarization if content is too long
- Supports:
  - Recency prioritization
  - Top-K similarity
  - Agent intent alignment

---

## VI. API & Interface

### A. REST API (via FastAPI backend)

```http
GET    /api/prompts/{id}           # Get specific prompt
POST   /api/prompts/compile        # Compose prompt with inputs
GET    /api/prompts/agent/{name}   # Get full prompt stack for agent
POST   /api/prompts/new            # Create new prompt
PUT    /api/prompts/{id}           # Update existing prompt
DELETE /api/prompts/{id}           # Archive prompt (soft delete)
```

### B. Agent SDK Methods (for internal calls)

```ts
const prompt = await promptManager.compile({
  task: 'summarize_text',
  persona: 'scientist',
  context: [docA, memoryB],
});
```

---

## VII. Security and Compliance

- All prompt accesses logged (agent_id, user_id, timestamp, tags)
- Dangerous keywords flagged via regex + ML
- PII scrubber for names, emails, phone numbers, IPs
- Role-based prompt access control
- Configurable prompt masking (e.g., no inner prompt details revealed to downstream agents)

---

## VIII. Future Features

| Feature                   | Target Version |
|---------------------------|----------------|
| Prompt Diff Viewer        | v1.1           |
| Prompt Mutation Engine    | v1.2           |
| Prompt Debug Mode         | v1.2           |
| Prompt Evaluation Bench   | v1.3           |
| Prompt Clustering & Tags  | v1.4           |
| Persona-Prompt Optimizer  | v2.0           |

---

### Changelog
- 2025-06-20: Initial detailed spec (full-stack, APIs, context system, templates)


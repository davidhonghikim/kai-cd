# 38: Prompt Manager and Prompt Asset System

This document defines the architecture, components, and configuration of the Prompt Manager subsystem within kAI and kOS. This system enables standardized creation, editing, versioning, execution, and distribution of prompt-based assets.

---

## I. Purpose

To enable consistent prompt engineering across agents, services, and user interfaces by establishing a central hub for:
- Prompt storage and classification
- Prompt lifecycle management
- Parameterized prompt templates
- Execution logging and benchmarking
- Team sharing, tagging, and versioning

---

## II. Directory Structure

```text
src/
├── prompts/
│   ├── index.ts                         # Entry point for prompt manager logic
│   ├── registry/
│   │   ├── promptIndex.json             # Flat index of all prompts
│   │   ├── categories.json              # Tag/label taxonomy for browsing
│   │   └── groups.json                  # Role-based grouping and permissions
│   ├── templates/
│   │   ├── general/
│   │   │   ├── summarize.zprompt        # Zod+YAML based prompt template
│   │   │   ├── explain.zprompt
│   │   └── creative/
│   │       ├── storygen.zprompt
│   │       └── poem.zprompt
│   ├── runner/
│   │   ├── PromptEngine.ts              # Parameter injection + formatting
│   │   ├── PromptRunner.ts              # Executes prompt with selected LLM
│   │   ├── PromptLogger.ts              # Logs input/output/results
│   │   └── PromptProfiler.ts            # Benchmarks token count, latency, cost
│   ├── editor/
│   │   ├── PromptEditor.tsx             # Rich UI for creating/editing prompts
│   │   ├── LivePreview.tsx              # Render preview with parameters
│   │   └── PromptDiffView.tsx          # Version diff viewer
│   └── utils/
│       ├── TokenCounter.ts              # Fast tokenizer integration (gpt2, cl100k)
│       └── PromptValidator.ts           # Lint and schema check
```

---

## III. Prompt Template Format (`.zprompt`)

Prompt files are defined in extended YAML+Zod schema for validation and parameterization:

```yaml
id: summarize
name: Summarize Text
category: general
persona: explainer
model: gpt-4
parameters:
  - id: input
    type: string
    label: Input Text
    required: true
  - id: style
    type: select
    label: Summary Style
    options: ["concise", "detailed", "bulleted"]
    default: concise
prompt: |
  Please summarize the following in a {{style}} format:
  ---
  {{input}}
```

---

## IV. Runtime Configuration

Prompt execution system supports:
- Default model fallback per prompt type
- Global injection (system prompt prefix)
- Max token and cost quota settings per run
- Prompt caching and deduplication

Defined via:
```ts
interface PromptRunConfig {
  defaultModel: string;
  injectSystemPrompt?: string;
  maxTokens?: number;
  maxCostUSD?: number;
  retryPolicy?: 'once' | 'retry3' | 'never';
}
```

---

## V. UI Features (Prompt Editor)

- Sidebar folder tree
- Live tokenizer stats
- Inline test runner
- Tag and persona assignment
- Draft/version switcher
- One-click deploy to agent workspace
- Import/export as `.zprompt` or JSON

---

## VI. Prompt Execution Modes

| Mode           | Description                             | Used By           |
|----------------|-----------------------------------------|-------------------|
| `inline`       | Called in agent task runtime            | Agents            |
| `manual`       | Run from UI                             | User-triggered    |
| `batch`        | Multi-input prompt job from file/upload | kAI Tasks         |
| `chained`      | Output of one prompt feeds the next     | Pipelines         |

---

## VII. Version Control

Each prompt supports:
- Draft & published versions
- Version notes & changelog
- Locked system prompts (non-editable)
- Git-like diff viewer with rollback

---

## VIII. API Contracts

All prompt functions are exposed as internal API methods:
```ts
GET    /api/prompts             // List all prompts
GET    /api/prompts/{id}        // Get prompt metadata & content
POST   /api/prompts             // Create or update prompt
POST   /api/prompts/run         // Run prompt with inputs
```

---

## IX. Security & Permissions

- Prompts stored in encrypted local vault
- Permission groups (creator, editor, viewer)
- Drafts require auth token or system signature
- Prompt execution logs redacted of PII

---

## X. Integration with Agents

Each agent may:
- Load prompt library dynamically on boot
- Bind default prompts to tasks
- Accept runtime prompt overrides
- Expose new prompt templates via manifest

---

## XI. Future Enhancements

| Feature                       | Status     |
|------------------------------|------------|
| Prompt performance telemetry | Planned    |
| Agent prompt auto-training   | Planned    |
| Multi-model routing hints    | In design  |
| Shared team prompt libraries | Beta       |
| Prompt lint rulesets         | Alpha      |

---

## XII. Glossary

| Term         | Meaning                                           |
|--------------|---------------------------------------------------|
| `.zprompt`   | Validated YAML prompt + metadata format           |
| Persona      | Agent-facing role descriptor for prompt style     |
| Inline Run   | Execution from within a task or UI context        |
| Chained Run  | Prompt used as part of a multi-step pipeline      |
| Tokenizer    | Utility for real-time token/cost estimation       |

---

### Changelog
– 2025-06-21 • Initial full specification (AI agent)


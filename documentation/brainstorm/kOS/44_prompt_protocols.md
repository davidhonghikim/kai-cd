# 44: Prompt Management Protocols (kAI)

This document defines the system architecture, configuration, and storage structure for prompt management, routing, lifecycle, and reuse within the Kind AI (kAI) system. Prompts are the lifeblood of LLM interaction, and this module ensures robust, traceable, and modular prompt workflows.

---

## I. Purpose

Prompt management provides a unified interface to:
- Define reusable prompt templates.
- Dynamically compose prompts based on context and agent role.
- Track prompt performance, versioning, and outcomes.
- Share prompts across users, agents, and systems.

---

## II. Directory Structure

```text
src/
└── core/
    ├── prompts/
    │   ├── PromptManager.ts             # Prompt registry, lookup, templating
    │   ├── PromptExecutor.ts            # Applies templates and calls LLMs
    │   ├── PromptContext.ts             # Context resolver and variable mapper
    │   ├── PromptTracker.ts             # Records executions and metadata
    │   └── stores/
    │       ├── PromptStore_Local.ts     # Local IndexedDB / FS
    │       └── PromptStore_Remote.ts    # Remote sync (S3, GCS, or Supabase)
    └── types/
        ├── PromptSchema.ts             # PromptTemplate, PromptExecution types
        └── PromptMetrics.ts            # Scoring, feedback, runtime data
```

---

## III. Prompt Schema

```ts
interface PromptTemplate {
  id: string;                     // UUID or slug
  name: string;
  description?: string;
  persona?: string;              // Optional agent context
  tags?: string[];
  template: string;              // e.g., "Summarize: {{input}}"
  inputs: string[];              // Required input variables
  contextScope?: 'user' | 'system' | 'session';
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptExecution {
  executionId: string;
  templateId: string;
  inputValues: Record<string, string>;
  resolvedPrompt: string;
  model: string;
  response: string;
  runtimeMs: number;
  score?: number;                // Feedback rating
  feedback?: string;
  timestamp: string;
}
```

---

## IV. Template Ingestion & Use

### A. Adding Prompts
1. UI Form via Web Panel or Kai-CD extension.
2. Import `.prompt.json` files from community repo.
3. Auto-generated prompts via AgentScript or kAI tools.

### B. Runtime Execution
1. Resolve required variables (`PromptContext`)
2. Fill `{{input}}` style templates (`PromptExecutor`)
3. Send resolved prompt to LLM endpoint (OpenAI, Ollama, Claude, etc.)
4. Store result + metadata in `PromptTracker`

---

## V. Storage Backend Options

| Backend     | Use Case                        |
|-------------|----------------------------------|
| IndexedDB   | Browser-local Kai-CD agent use  |
| SQLite      | Offline-first desktop usage     |
| Supabase    | Sync across devices / users     |
| S3 / GCS    | Export and archive capability   |
| Redis       | Fast shared caching             |

---

## VI. Scoring, Feedback & Metrics

- Agents or users can rate prompts after use.
- Prompt metrics include:
  - Avg response time
  - Accuracy/score (manual or automated eval)
  - Model compatibility history
  - Reuse frequency and tags

```ts
interface PromptScore {
  templateId: string;
  score: number;             // 1–5 or 0–100
  notes?: string;
  timestamp: string;
  agentId?: string;
}
```

---

## VII. Integration With Agents

Agents use the `PromptManager` module to:
- Load or fetch predefined prompts
- Compose prompts on the fly
- Retrieve execution history for context
- Attach scoring and reasoning metadata

Prompt use is declared in the agent's capabilities profile:
```ts
capabilities: [
  {
    type: 'llm_prompt',
    promptTemplates: ['summarize.text', 'extract.json'],
    inputTypes: ['text', 'markdown'],
    outputType: 'summary'
  }
]
```

---

## VIII. Prompt Export & Sharing

Prompts can be:
- Exported to `.prompt.json`
- Published to the `kPromptHub` registry
- Cloned across agents or systems
- Synced to Supabase or S3 for distribution

---

## IX. Prompt Editor Features (UI)

- Real-time template preview
- Variable insertion autocomplete
- Persona switching (simulated agents)
- Prompt performance dashboard
- Import/export UI with history log

---

## X. Future Plans

| Feature                    | Target Version |
|---------------------------|----------------|
| LLM-scored prompt ranking | v1.2           |
| Multi-modal prompt chains | v1.3           |
| Prompt A/B testing        | v1.4           |
| Prompt recommendation AI | v2.0           |


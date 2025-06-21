# 76: Prompt Architecture & Knowledge Embedding System

This document defines the complete prompt engineering, routing, and embedded knowledge architecture for agents, UI components, and system workflows within the `kAI` and `kOS` ecosystem.

---

## I. Purpose

To standardize and modularize prompt design, lifecycle, memory enrichment, persona blending, and context embedding across all usage scenarios:

- Consistent, explainable behavior across agents
- Efficient context compression and reuse
- Personalized, multi-agent prompt orchestration
- Pluggable knowledge and skill integration

---

## II. Prompt Classes

Each prompt falls into one or more of the following structural classes:

| Class            | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `task.init`      | Base instruction to initialize agent behavior               |
| `task.chain`     | Used in decomposed chains or workflow sequences             |
| `persona.inject` | Blends memory, tone, identity into the agent persona        |
| `context.embed`  | Injects dynamic memory, facts, timelines, or KB into prompt |
| `routing.prompt` | Used for LLM or rule-based agent routing decisions          |
| `ui.system`      | Local UI-interaction-specific prompts (chat, buttons, etc)  |

---

## III. Prompt File Directory Structure

All prompts are stored in the unified path: `prompts/`

```text
prompts/
├── agent/
│   ├── base/
│   │   ├── default_init.txt
│   │   └── task_init_generic.md
│   ├── chain/
│   │   ├── breakdown_analyzer.md
│   │   ├── subtasks_mapper.md
│   ├── persona/
│   │   ├── inject_empathy.md
│   │   ├── inject_expert_tone.md
│   └── system/
│       ├── sandbox_rules.md
│       └── audit_trail_notice.md
├── knowledge/
│   ├── embeddings/
│   │   ├── startup_builder_guide.md
│   │   ├── startup_funding_strategies.md
│   └── documents/
│       └── example_contract_law_summary.txt
├── routing/
│   ├── auto_route_logic.md
│   └── classifier_rules.md
└── ui/
    ├── chat_user_greeting.txt
    └── context_menu_default.txt
```

---

## IV. Prompt Variable Tokens

Prompt templates use safe tokens that are dynamically replaced before sending to the model:

```handlebars
{{user_name}}
{{agent_name}}
{{task_description}}
{{prior_context}}
{{agent_persona}}
{{injected_knowledge}}
{{system_rules}}
```

This enables full decoupling of content from logic.

---

## V. Prompt Assembly Pipeline

Each prompt is assembled using the `PromptAssembler` system:

```text
[Base Init Prompt]
+ [Persona Injector]
+ [Context Embeds]
+ [Memory Excerpts]
+ [Task Parameters]
→ FinalPromptOutput
```

Each step logs substitutions, token count, and semantic drift estimation.

---

## VI. Prompt Context Memory

Agents have two types of memory that can be injected into prompts:

1. **Semantic Memory (Vector DB)** — Factual memories from user interactions or documents.
2. **Event Memory (Chronological Log)** — Timestamped logs of events.

These are processed through summarizers and relevance scorers before prompt injection.

```ts
function selectRelevantMemories(task, currentContext) -> MemorySummary[]
```

---

## VII. Embedded Knowledge Modules

Documents in `prompts/knowledge/documents/` are automatically converted to embeddings and indexed.

| Format        | Allowed Types                |
| ------------- | ---------------------------- |
| `.md`, `.txt` | Clean plain-text or Markdown |

These are chunked (512-1024 tokens), embedded (Qdrant, Weaviate), and attached via `context.embed` blocks.

---

## VIII. Persona Injection

Agents declare a base persona, which is enhanced by:

- User-specified traits (e.g. tone, patience)
- System constraints (security, compliance)
- Social context (audience, platform)

```ts
PersonaModel = BasePersona + ContextTraits + SituationalModifiers
```

---

## IX. Prompt Constraints & Safety Rules

Each prompt is post-processed by the `PromptSafetyGuard`:

- Token Budget Analysis
- Dangerous Instruction Filtering
- Compliance Tagging (`safe`, `requires_supervision`, etc.)
- Chain-of-Trust Embedding for audits

---

## X. Prompt Debugging & Logs

All prompt assemblies are logged to:

```
logs/prompts/YYYY-MM-DD/session_id/
  assembled_prompt.json
  substitutions.log
  token_count.txt
```

Debug UI is available in Dev Panel > Prompt Inspector.

---

## XI. Example Prompt Composition (Chat Agent)

```ts
FinalPrompt = `
You are {{agent_name}}, a friendly assistant.

Your task: {{task_description}}

Context:
{{prior_context}}

Tone: {{agent_persona}}

Relevant Info:
{{injected_knowledge}}

Follow all system rules.

{{system_rules}}
`
```

---

### Changelog

– 2025-06-20 • Initial system design, prompt lifecycle architecture


# 11: PromptTransformer Engine Specification

This document specifies the architecture, transformation pipeline, plugin system, and security policies for the `PromptTransformer` module within kindAI (kAI) and kindOS (kOS). It acts as the central processing engine for modifying and enriching prompts before agent use.

---

## I. Purpose

The `PromptTransformer` is responsible for:

- Injecting context (memory, files, conversation history)
- Performing summarization or translation
- Resolving dynamic variables (e.g., `{username}`, `{today}`)
- Applying optional layers (emotion filter, tone modulation, etc.)
- Supporting prompt chaining (multi-stage prompt workflows)

---

## II. File Structure

```text
src/core/prompt/
├── PromptTransformer.ts
├── transformers/
│   ├── context_injector.ts
│   ├── summarizer.ts
│   ├── tone_modifier.ts
│   ├── language_translator.ts
│   └── variable_resolver.ts
└── plugins/
    ├── emotion_overlay.ts
    └── ai_augment.ts
```

---

## III. Configuration

Settings defined in: `config/prompt_transformer.json`

```json
{
  "max_context_items": 10,
  "summarize_above_tokens": 800,
  "default_language": "en",
  "enable_plugins": ["emotion_overlay"],
  "auto_translate": false
}
```

---

## IV. Transformation Pipeline

### A. Flow Diagram

1. **Input Prompt Template** →
2. **VariableResolver** →
3. **ContextInjector** (adds memory, history, docs) →
4. **Summarizer** (if needed) →
5. **LanguageTranslator** (if enabled) →
6. **ToneModifier / EmotionOverlay** →
7. **Output Final Prompt**

---

## V. Component Responsibilities

### 1. `variable_resolver.ts`

- Replaces dynamic placeholders like `{user_name}`, `{timestamp}`
- Built-in tokens: `{today}`, `{agent_name}`, `{platform}`

### 2. `context_injector.ts`

- Pulls relevant memory embeddings from `kMemory`
- Injects message history if `thread_id` provided
- Loads files/documents from `artifactStore`
- Implements Top-K semantic similarity matching

### 3. `summarizer.ts`

- Triggers if combined context exceeds `summarize_above_tokens`
- Uses local LLM (via Ollama) or remote (OpenAI, Claude)
- Optimized for lossless compression of factual content

### 4. `language_translator.ts`

- Detects non-default input language
- Optionally translates prompt body to match default or target language

### 5. `tone_modifier.ts`

- Applies persona tone (e.g., Formal, Casual, Academic)
- Works via prompt fragments + fine-tuned embeddings

### 6. Plugins (optional)

- `emotion_overlay.ts`: Injects emotional coloration (e.g. excitement, compassion)
- `ai_augment.ts`: Allows other agents to inspect and modify prompt mid-flight

---

## VI. API Usage

```ts
const output = await transformer.run(
  inputPrompt,
  {
    variables: { user_name: 'Sarah' },
    thread_id: 'conv-93223',
    documents: ["./artifacts/report.txt"],
    target_language: "en",
    persona_tone: "Academic"
  }
);
```

---

## VII. Security & Logging

- Each transformation layer logs timestamp, agent, and delta output
- Plugins must declare access scope
- PII stripping optional after summarization step
- Logged under: `logs/prompts/transform_history.log`

---

## VIII. Future Features

| Feature                    | Target Version |
| -------------------------- | -------------- |
| Token Optimizer (chunker)  | v1.2           |
| Prompt Watermarking        | v1.3           |
| GPT-based Intent Rewriter  | v1.4           |
| JSON Schema Prompt Adapter | v2.0           |

---

### Changelog

- 2025-06-21: Initial full implementation spec with plugins, pipeline, and file layout


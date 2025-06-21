# 13: Prompt Validator Spec

This document defines the internal validation system for prompts and completions within the kAI and kOS framework. The Prompt Validator ensures that all messages adhere to security policies, quality standards, formatting rules, and system requirements prior to dispatching to LLMs or routing to user interfaces.

---

## I. Purpose

The Prompt Validator module provides:

- Preflight validation of prompt content, format, and security policy adherence.
- Post-generation output validation to catch harmful, malformed, or noncompliant completions.
- A hookable plugin-style framework to add or modify validators per agent, context, or system state.

---

## II. Directory Structure

```text
src/
└── core/
    └── prompt/
        ├── validator/
        │   ├── PromptValidator.ts              # Orchestrator
        │   ├── rules/
        │   │   ├── LengthRule.ts               # Checks token/char budget
        │   │   ├── ProfanityRule.ts            # Filters NSFW or offensive input
        │   │   ├── InjectionBlockRule.ts       # Detects prohibited patterns (e.g., prompt injection)
        │   │   ├── JSONSchemaRule.ts           # Validates JSON structures in prompt or output
        │   │   └── RoleScopeRule.ts            # Ensures content matches role (e.g., assistant-only)
        │   └── validator_configs/
        │       ├── policies.yaml
        │       ├── regex_filters.yaml
        │       └── roles.yaml
```

---

## III. Validation Pipeline

### A. Prompt Validation (Before LLM Dispatch)

1. **LengthRule**

   - Validates prompt length (tokens and characters)
   - Enforced from transformer settings or agent config

2. **ProfanityRule**

   - Uses regex + keyword-based filters
   - Optional external library: `bad-words`, `leo-profanity`, or HuggingFace model

3. **InjectionBlockRule**

   - Prevents known prompt injection strings (e.g., `ignore previous instructions`, `pretend you are`)
   - Optionally LLM-augmented detection

4. **RoleScopeRule**

   - Ensures prompt matches intended role behavior
   - Example: Disallows user trying to issue system commands via user-level UI

### B. Completion Validation (After LLM Response)

1. **LengthRule**

   - Enforces max output token count
   - Ensures completion fits in downstream systems (e.g., text-to-speech limit)

2. **ProfanityRule** (repeat)

   - Sanitizes accidental generation of inappropriate content

3. **JSONSchemaRule**

   - Parses completions that return JSON
   - Validates against expected schema (e.g., structured response agents)

4. **InjectionBlockRule**

   - Detects and blocks signs of prompt re-injection
   - Flags suspicious repetition of instructions or role breaks

5. **Custom Rules (optional)**

   - User-defined rules for project-specific policies
   - Example: No geopolitical references, or academic tone enforcement

---

## IV. Config Files

### `policies.yaml`

```yaml
length_limits:
  prompt_tokens: 2048
  completion_tokens: 1024

allow_profanity: false
injection_patterns:
  - "ignore all previous"
  - "you are now"
  - "simulate a system"
role_enforcement:
  user:
    forbidden_phrases:
      - "as an AI language model"
      - "I cannot fulfill"
```

### `regex_filters.yaml`

```yaml
profanity:
  - "\b(fuck|shit|bitch|damn)\b"
  - "\b(nazi|hitler|rape|murder)\b"
  - "[\u202e\u200f\u200e]" # RTL injection
```

### `roles.yaml`

```yaml
roles:
  system:
    scope: ["setup", "governance", "security"]
  assistant:
    scope: ["chat", "summarization", "qa"]
  user:
    scope: ["prompt", "feedback"]
```

---

## V. API Usage (Internal)

```ts
const validatedPrompt = await promptValidator.validatePrompt({
  text: userInput,
  agentRole: 'user',
  config: policyConfig
});

const safeCompletion = await promptValidator.validateCompletion({
  text: llmOutput,
  agentRole: 'assistant'
});
```

---

## VI. Logging, Reporting & Auditing

- Each rule logs:
  - Pass/fail status
  - Offending patterns (if failed)
  - Rule metadata and time
- Audit reports attached to message logs with tags like `injection_detected`, `schema_valid`, `content_clean`

---

## VII. Future Additions

| Feature                   | Target Release |
| ------------------------- | -------------- |
| LLM-based rule evaluation | v1.2           |
| Auto-fix suggestions      | v1.3           |
| GUI rule builder (kOS)    | v1.5           |
| Agent-specific validators | v1.4           |
| Real-time validation UI   | v2.0           |

---

### Changelog

- 2025-06-20: Initial complete spec for all validator modules and config systems


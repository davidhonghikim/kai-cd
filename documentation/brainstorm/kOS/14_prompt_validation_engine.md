# 14: Prompt Validation Engine

This document defines the architecture, components, and rules of the Prompt Validation Engine (PVE) in kAI (Kind AI) and kOS (Kind OS). The PVE ensures that prompts are compliant with system policies, safety rules, structural expectations, and runtime constraints before being submitted to LLMs or agents.

---

## I. Purpose

The Prompt Validation Engine guarantees prompt integrity, safety, policy alignment, and formatting compliance. It acts as a pre-send gatekeeper within the kAI pipeline.

---

## II. Directory Structure

```text
src/
└── core/
    └── prompt/
        ├── validator/
        │   ├── PromptValidator.ts            # Main orchestrator class
        │   ├── SchemaValidator.ts            # Validates prompt shape/structure
        │   ├── SafetyFilter.ts               # Profanity, hate speech, violence, etc.
        │   ├── PolicyComplianceChecker.ts    # Validates against user/org policy
        │   ├── PromptLinter.ts               # Checks prompt style, clarity, tone
        │   ├── RuntimeConstraintChecker.ts   # Token budget, memory references, etc.
        │   └── validator_configs/
        │       ├── safety_rules.yaml
        │       ├── structure_schema.yaml
        │       ├── linter.yaml
        │       └── policy_profiles.yaml
        └── validator_logs/
            └── *.json                         # JSON validation audit logs per prompt
```

---

## III. Validation Flow

### A. Validator Pipeline

1. **SchemaValidator**

   - Ensures required fields are present (`prompt`, `lang`, `persona`, etc.)
   - Validates object shape against strict schema (using Zod or Joi)

2. **SafetyFilter**

   - Filters prompts for NSFW content, hate speech, violence, discrimination
   - Uses OpenAI Moderation API (optional), Detoxify, or local regex model

3. **PolicyComplianceChecker**

   - Checks for violations of user/org policies (e.g., no political prompts)
   - Loads per-user or per-deployment rules

4. **PromptLinter**

   - Warns on passive voice, overly long sentences, vague requests
   - Suggests rewrites with more specificity (optional fix mode)

5. **RuntimeConstraintChecker**

   - Calculates estimated token usage
   - Verifies memory reference count, memory domain whitelist
   - Enforces prompt size ceiling

---

## IV. Example Configuration Files

### `safety_rules.yaml`

```yaml
filters:
  profanity: true
  sexual_content: true
  violence: true
  self_harm: true
models:
  use_openai_moderation: false
  local:
    name: detoxify
    threshold: 0.85
```

### `structure_schema.yaml`

```yaml
required_fields:
  - prompt
  - lang
  - persona
prompt:
  type: string
  min_length: 8
  max_length: 2048
```

### `linter.yaml`

```yaml
rules:
  passive_voice: warn
  ambiguous_terms: warn
  long_sentences:
    enabled: true
    max_words: 30
fix_suggestions: true
```

### `policy_profiles.yaml`

```yaml
profiles:
  default:
    disallowed_topics:
      - politics
      - religion
      - adult_content
    mandatory_prefixes:
      - "As your AI assistant..."
```

---

## V. Sample Usage (Internal API)

```ts
const validator = new PromptValidator();
const result = await validator.validate({
  prompt: "How do I hack a server?",
  lang: 'en',
  persona: 'neutral'
});

if (!result.isValid) {
  console.warn("Prompt rejected:", result.errors);
} else {
  sendToLLM(result.cleanedPrompt);
}
```

---

## VI. Validation Report Structure

```json
{
  "promptId": "abc123",
  "timestamp": "2025-06-20T23:45:01Z",
  "isValid": false,
  "errors": [
    {
      "type": "safety",
      "message": "Prompt flagged for hate speech (toxicity score: 0.91)"
    },
    {
      "type": "policy",
      "message": "Prompt contains disallowed topic: politics"
    }
  ],
  "suggestions": [
    "Rephrase to focus on historical analysis rather than political commentary."
  ],
  "logPath": "validator_logs/abc123.json"
}
```

---

## VII. Future Roadmap

| Feature                      | Target Version |
| ---------------------------- | -------------- |
| LLM-Based Linter Suggestions | v1.2           |
| User-Custom Validation Hooks | v1.3           |
| Live Validation in UI Editor | v1.4           |
| Org-Scoped Policy Templates  | v2.0           |

---

### Changelog

- 2025-06-20: Initial blueprint for strict prompt validation engine.


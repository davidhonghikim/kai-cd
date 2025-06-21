# 12: Prompt Validator Specification

This document details the architecture, logic, and safety mechanisms for the Prompt Validator subsystem within kAI (Kind AI) and kOS (Kind OS). The Prompt Validator ensures that all prompts adhere to defined policies, security standards, and contextual integrity before execution or relay to LLM endpoints.

---

## I. Purpose

The Prompt Validator enforces prompt compliance across:

- Security boundaries
- PII and data leakage prevention
- Organizational prompt policies
- LLM safety input checks
- Format and token constraints

---

## II. Directory Structure

```text
src/
└── core/
    └── prompt/
        ├── validators/
        │   ├── PromptSchemaChecker.ts      # Structural checks (required fields, types)
        │   ├── PromptPIIFilter.ts          # Redacts names, numbers, emails, IPs
        │   ├── PromptLengthLimiter.ts      # Enforces max token limits
        │   ├── PromptPolicyEnforcer.ts     # Customizable rules per user/org/system
        │   ├── PromptSafetyScanner.ts      # Banned words, hallucination risks
        │   └── ValidatorPipeline.ts        # Composes validation steps
        └── validator_configs/
            ├── pii_patterns.yaml
            ├── max_lengths.yaml
            └── policy_rules.yaml
```

---

## III. Validation Pipeline

### A. Step-by-Step Flow

1. **PromptSchemaChecker**

   - Ensures presence of `task`, `persona`, `context` fields
   - Validates types and formats

2. **PromptLengthLimiter**

   - Computes estimated token count using tokenizer (`tiktoken`, `gpt-encoder`)
   - Enforces soft and hard limits

3. **PromptPIIFilter**

   - Uses regex + NLP to detect:
     - Names
     - Emails
     - Phone Numbers
     - IP addresses
     - Medical terms
   - Redacts or masks with `<REDACTED>`

4. **PromptPolicyEnforcer**

   - YAML-defined org/user policies:
     - No prompts about violence, illegal content
     - Task-specific whitelisting
     - Persona-safety mappings (e.g., no sarcasm with children)

5. **PromptSafetyScanner**

   - Flags prompts with known LLM-injection phrases
   - Detects unsafe directives (e.g. `Ignore all previous...`)
   - Scores for hallucination potential (using tuned classifier)

---

## IV. Configurations

### A. `pii_patterns.yaml`

```yaml
patterns:
  - name: email
    regex: '[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}'
  - name: ip_address
    regex: '\b(?:\d{1,3}\.){3}\d{1,3}\b'
  - name: phone
    regex: '\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'
```

### B. `max_lengths.yaml`

```yaml
limits:
  default: 2048
  summarizer: 1024
  translator: 3072
```

### C. `policy_rules.yaml`

```yaml
rules:
  - task: '*'
    persona: 'child'
    deny:
      - sarcasm
      - violent_content
  - task: 'medical_query'
    persona: '*'
    allow_only:
      - doctor
      - nurse
```

---

## V. API Integration

```ts
const result = await promptValidator.validate(promptObject);
if (!result.valid) {
  throw new Error(result.reason);
}
```

Returns a structured result object:

```ts
interface ValidationResult {
  valid: boolean;
  reason?: string;
  redactedPrompt?: string;
  violations?: string[];
}
```

---

## VI. Logging & Auditing

- Logs every validation failure
- Tags with `prompt_id`, `user_id`, `agent_name`, `violation_type`
- Stores redacted versions and diffs (if changed)
- Periodic summaries via analytics engine (optional plugin)

---

## VII. Future Enhancements

| Feature                    | Target Version |
| -------------------------- | -------------- |
| Context-Aware Redaction    | v1.2           |
| LLM-based Violation Repair | v1.3           |
| Multi-lingual PII Scrubber | v1.3           |
| Prompt Safety Score Report | v1.4           |
| Compliance Mode            | v2.0           |

---

### Changelog

- 2025-06-20: Initial detailed blueprint with validator pipeline and config system.


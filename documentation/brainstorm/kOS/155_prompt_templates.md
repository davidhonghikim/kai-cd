# 155: Prompt Composition Templates & Injection Strategies

This document specifies the architecture, file structures, patterns, and security strategies for constructing modular prompt templates and injecting them safely into agents, workflows, or user interfaces across `kAI` and `kOS` systems.

---

## I. Purpose & Overview

Prompt composition in Kind AI must:

- Be modular and reusable
- Allow context-specific overrides
- Include fallback variants for safety
- Be protected from malicious input injection
- Support templating engines for both static and dynamic use cases

---

## II. Prompt Template Types

### 1. **Base Prompt Templates**

- Core instructional prompts
- Stored in: `prompts/base/`
- Example: `base_agent_instructions.md`, `base_memory_loader.txt`

### 2. **Agent Role Templates**

- Define specialized behavior per agent type
- Stored in: `prompts/roles/`
- Example: `critique_agent.md`, `patch_agent.md`, `planner_agent.md`

### 3. **System Prompts**

- High-privilege instructions or default system roles
- Stored in: `prompts/system/`
- Example: `supervisor_guardrails.yaml`, `safe_executor.md`

### 4. **Flow Templates**

- Encapsulate full multi-step prompt flows with variables
- Stored in: `prompts/flows/`
- Example: `onboarding_flow.yaml`, `bug_fix_flow.yaml`

### 5. **Contextual Fragments**

- Micro-templates used for injecting:
  - Memory summaries
  - Past chat history
  - File contents
  - Semantic highlights
- Stored in: `prompts/fragments/`

### 6. **User-Editable Templates**

- Allow users to configure their own styles, tones, policies
- Stored in: `user_data/prompts/`

---

## III. Template Format & Variables

### Format Options

- `.md`, `.txt` for static prompts
- `.yaml` or `.json` for structured flows or metadata

### Variable Syntax

```handlebars
{{user_input}}
{{agent_name}}
{{memory_summary}}
{{context::filename.md}}
```

### Injection Example

```yaml
flow_id: research_flow
steps:
  - id: collect
    prompt: "{{context::summarized_web_results}}\n\nNow extract key facts."
  - id: analyze
    prompt: "You are {{agent_name}}. Analyze the following: {{memory_summary}}"
```

---

## IV. Prompt Injection Protection

### 1. Escaping Dangerous Sequences

- Detect `{{`, `}}`, `<<`, `>>`, etc., from user input
- Escape or drop based on ruleset

### 2. Prompt Sanitization Library

- Implement `promptSanitizer.ts`:
  - Escape dangerous tokens
  - Normalize newline and quote styles
  - Scan for adversarial payloads (regex + ML-based filters)

### 3. Context Segmentation

- Never concatenate user input directly into instruction blocks
- Use separate memory slots for untrusted vs trusted tokens

---

## V. Template Management Tools

### 1. Prompt Manager Agent

- UI + CLI interface to view/edit templates
- Version history
- Context previews
- Import/export formats

### 2. Template Registry

- Indexed by:
  - Template ID
  - Usage domain (chat, image, search, etc.)
  - Last updated

### 3. Injection Validator

- Test harness to simulate:
  - Variable rendering
  - Token count estimation
  - Flow safety reports

---

## VI. Runtime Engine: PromptRunner

### Functions

- `loadTemplate(id)`
- `injectVariables(data)`
- `estimateTokens(template + variables)`
- `simulateExecutionFlow(templateId)`

### Error Handling

- If variable is missing:
  - Insert fallback stub: `{{!missing_variable}}`
  - Log warning

---

## VII. Example Directory Structure

```
kos-core/
  prompts/
    base/
      base_agent.txt
    roles/
      planner_agent.md
    system/
      guardrails.md
    flows/
      onboarding_flow.yaml
    fragments/
      user_summary.txt
  user_data/
    prompts/
      custom_style.md
```

---

## VIII. Future Enhancements

- Prompt versioning and change diffs
- Embedded evaluations in templates
- Semantic hashing for template deduplication
- Prompt compression for token optimization

---

### Changelog

– 2025-06-21 • Initial draft of full prompt templating system


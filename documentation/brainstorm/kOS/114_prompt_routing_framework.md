# 114: Prompt Routing and Injection Framework

This document outlines the complete routing, transformation, and injection system for prompt management in `kAI` (Kind AI) and its integration across modules, services, and interfaces.

---

## I. Overview

The Prompt Routing Framework ensures that:

- Prompts are dynamically structured, transformed, filtered, and routed based on context.
- Agents can inject, modify, and interpret prompts in a decentralized or centralized architecture.
- Full auditability and traceability are retained for all prompt transformations.

---

## II. Directory Structure

```text
/kindai/
├── prompts/
│   ├── router/
│   │   ├── PromptRouter.ts
│   │   ├── strategies/
│   │   │   ├── ChainOfThought.ts
│   │   │   ├── RolePlayInjection.ts
│   │   │   ├── LanguageSwitching.ts
│   ├── filters/
│   │   ├── ProfanityFilter.ts
│   │   ├── ComplianceFilter.ts
│   │   ├── SensitiveTopicFilter.ts
│   ├── transformers/
│   │   ├── LanguageTransformer.ts
│   │   ├── ContextNormalizer.ts
│   │   ├── PersonaEmbedder.ts
│   ├── injection/
│   │   ├── InjectSystemPrompt.ts
│   │   ├── InjectToolUseHints.ts
│   ├── audits/
│   │   ├── PromptHistoryLogger.ts
│   │   ├── PromptChainTrace.ts
│   └── index.ts
```

---

## III. Core Components

### A. `PromptRouter`

- Accepts incoming request metadata and decides the optimal path (prompt config + filters + transformers).
- Implements:
  - Rule-based routing
  - Vector-based similarity lookup
  - Persona/role-based decision trees

### B. `Prompt Filters`

- Apply pre-injection cleaning and security layers:
  - Obscenity removal
  - GDPR/PII redaction
  - Scenario-type blocking

### C. `Prompt Transformers`

- Modify prompt content before dispatch:
  - Normalize instructions
  - Translate or localize
  - Inject memory, tone, personality

### D. `Prompt Injectors`

- Insert system-level context before sending to LLM:
  - Tool usage hints
  - Function call schema
  - Persona definitions
  - User constraints (e.g., length, time)

### E. `Prompt Audit Logs`

- All transformations are recorded in a tamper-proof chain log:
  - `chain_id`, `step`, `before`, `after`, `timestamp`
  - Stored in Qdrant vector + S3 blob + Audit SQL table

---

## IV. Supported Protocols

- `KLP` (Kind Link Protocol) for cross-agent prompt transport
- `PromptRecord` schema for universal prompt representation
- `JSON-RPC` and `WebSocket` bridges
- Optional `PromptSigning` module for zero-trust networks

---

## V. Configurable Prompt Profiles

```json
{
  "name": "research_agent_default",
  "language": "en",
  "tone": "professional",
  "filters": ["profanity", "compliance"],
  "transformers": ["context_normalizer", "persona_embedder"],
  "injectors": ["inject_system_prompt"],
  "audit": true
}
```

---

## VI. Lifecycle Flow

1. **Input Metadata Received** → Includes user, role, intent, context
2. **PromptRouter Decision Tree** executes and loads profile
3. **Filters Applied** → Obfuscates or redacts bad input
4. **Transformers Run** → Localizes, styles, and enhances prompt
5. **Injection Layer** → Adds system prompt, metadata, constraints
6. **Prompt Sent to LLM**
7. **Response Logged and Enriched** → For future routing improvement

---

## VII. Example Use Case

**Use Case:** A support bot receiving multilingual user input

- `PromptRouter` matches input to "support\_response\_es"
- `LanguageTransformer` translates to English for the LLM
- `PersonaEmbedder` adds kind/supportive tone
- `InjectSystemPrompt` enforces function use for ticket creation
- Output retranslated back to Spanish
- Chain trace saved to prompt audit store

---

## VIII. Security Considerations

- Prompt injection detection module (regex + LLM classification)
- Signed prompt profiles with user tokens
- PII detection layer (NER-based)
- Prompt sandboxing mode for sensitive content

---

## IX. Monitoring & Metrics

- Prompt latency histogram
- Transformation count by type
- Filter rejection logs
- Audit signature validation failures

---

## X. Future Enhancements

- Zero-shot auto-rerouting based on real-time context
- Multimodal prompt routing (image/audio → prompt → LLM)
- Semantic prompt diffing for audit version trees
- Real-time prompt collaboration UI

---

### Changelog

– 2025-06-20 • Initial full prompt routing and injection spec


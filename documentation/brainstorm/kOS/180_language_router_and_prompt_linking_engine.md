# 180: Language Router And Prompt Linking Engine

## Overview

The Language Router and Prompt Linking Engine (LRPLE) is the modular subsystem responsible for multilingual input normalization, cross-language agent coordination, and dynamic prompt-link chaining. It ensures users can interact in any supported language while enabling AI agents to intelligently translate, route, and link prompts based on intention, persona, task, and protocol.

---

## Responsibilities

- Accept user prompts in any language and tokenize into intent + syntax + context.
- Detect language, dialect, sentiment, and regional cues.
- Translate prompt with semantic preservation for inner-AI routing.
- Route to appropriate agent/service/task using unified routing config.
- Support *prompt chain linking* using tags, embeddings, or intent scores.
- Maintain full prompt lineage and cross-linked references.
- Connect to the Knowledge Mesh and Vector Memory for context.

---

## Key Subcomponents

### 1. **Language Detection & Sentiment Analysis Engine (LDSE)**

- **Inputs**: Raw user prompt
- **Outputs**: ISO 639 language code, regional hints, tone profile
- **Tech Stack**: spaCy, langdetect, deepmoji, fasttext (optional custom fine-tuned LLMs)

### 2. **Semantic Preserving Translator (SPT)**

- **Purpose**: Translates prompt while preserving intent, cultural nuance, and personality tone.
- **Engines**: MarianMT, M2M-100, GPT-4 Turbo (if LLM route), LibreTranslate
- **Configurable** per agent: agents can opt out of translation or request source + translated copy.

### 3. **Intent Classifier & Router**

- **Classifier Model**: Trained fastText or LLM-powered intent classifier
- **Router Map**: Defined in `/configs/router/lang-intent-router.yaml`
- **Routing Targets**: Agents, Services, Systems, Search, ToolChains

### 4. **Prompt Link Graph Engine**

- Tracks prompt references and dependencies
- Creates linkable hashes and embedding summaries
- Used to visualize prompt graphs (see `PromptMap` component)
- Interoperates with audit and trace logs for explainability

### 5. **Routing Registry**

- JSON or YAML registry that defines fallback chains, handler preference, blocking rules
- Example:

```yaml
fallback:
  - agent: translator_agent
    condition: language_confidence < 0.75
  - agent: summarizer_agent
    condition: sentiment == "angry"
  
router:
  Japanese:
    - agent: nihon_helper
      type: primary
  es:
    - agent: spanish_teacher
      type: fallback
```

---

## Prompt Linking

Each prompt receives a unique SHA256 hash based on:

- Prompt text
- Agent context
- Timestamp
- Language + location fingerprint

These hashes are stored in the Prompt Ledger and cross-linked as graphs.

### Usage

- Enables follow-up questions to link back to original
- Enables conditional recall ("as I said last week")
- Serves vector augmentation and memory consistency

---

## Wire Protocols & APIs

### Internal gRPC API

- `DetectLanguage(Prompt) -> LanguageMeta`
- `TranslatePrompt(Prompt, TargetLang) -> Prompt`
- `RouteIntent(Prompt) -> RoutingTarget`
- `LinkPrompt(PromptA, PromptB, RelationshipType) -> LinkID`

### External REST API (kAI/kOS interop)

- `POST /prompt` - wrapped language-aware submission
- `GET /prompt/:hash/trace` - get lineage + links + metadata

---

## Storage & Indexing

- **Prompt History DB** (PostgreSQL + TimescaleDB)
- **Prompt Link Graph** (Neo4j or RedisGraph)
- **Prompt Embedding Store** (Qdrant / Chroma)

---

## Security & Privacy

- All prompt content hashed and encrypted at rest
- Local translation whenever possible
- Full opt-out option per user + per agent
- Uses secure session identity management from Identity Authority

---

## Future Enhancements

- Fine-tuned intent detection per culture
- Real-time voice input integration
- Federated multi-agent routing + consensus via KLP
- Prompt diplomacy layer for conflicting intent resolution

---

## Files

```
kai/
  language/
    __init__.py
    detector.py
    translator.py
    router.py
    linker.py
    schemas.py
    utils.py
    config/
      lang-intent-router.yaml
    tests/
      test_detector.py
      test_router.py
      test_linker.py
  prompts/
    ledger/
      prompts.db
    links/
      graph.db
    embeddings/
      qdrant.db
```

---

## Summary

The Language Router and Prompt Linking Engine serves as the multilingual nervous system of the Kind AI ecosystem. It enables seamless communication across humans and AI regardless of language, while powering dynamic, context-aware interactions across agents, services, and memory layers.


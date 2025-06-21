# 181: Language Router and Prompt Linking Engine

## Overview

The Language Router and Prompt Linking Engine (LR-PLE) is responsible for dynamically determining the optimal language model (LLM) and prompt configuration to route incoming user or agent messages, tasks, and contextual queries. This includes matching intent to appropriate model capabilities, language, domain context, and user/system preferences.

LR-PLE plays a central role in enabling the modularity and scalability of the kAI system by acting as an intelligent dispatcher between user inputs, system goals, available agents, and external or internal services.

---

## Core Responsibilities

### 1. **Intent Detection and Semantic Analysis**

- Uses lightweight transformer models (MiniLM, DistilBERT, etc.) to:
  - Classify input intent type (e.g., generate, summarize, translate, route, fetch, recall)
  - Perform semantic embedding to detect prompt similarity or task continuity
  - Tag language, sentiment, topic, domain

### 2. **LLM Router Logic**

- Based on:
  - Task complexity
  - Token budget
  - Security constraints
  - Latency/performance targets
  - User-defined preferences and cost
- Routes to:
  - Local LLMs (Ollama, LM Studio, llama.cpp)
  - Remote/commercial APIs (OpenAI, Anthropic, Cohere)
  - Specialized agents (math, coding, vision, etc.)

### 3. **Prompt Chain Linking Engine (PCLE)**

- Stores and retrieves:
  - Prompt call histories
  - System prompts and instruction chains
  - Output references from previous steps
- Enables recursive call linking for multi-agent chains
- Maintains metadata:
  - Source agent
  - Timestamp
  - Output fingerprint hash
  - Topic ID and memory vector key

### 4. **Routing Configuration Manager**

- Centralized config JSON:
  - `router.conf` with overrideable fields:
    - `default_llm`
    - `fallback_llm`
    - `budget_tokens`
    - `restricted_domains`
    - `preferred_agents`
    - `use_pc_linking`
- UI Integration with toggle switches and priority sliders
- Configurable hotkeys and CLI overrides

---

## Internal Architecture

```
/kai-core/router/
├── __init__.py
├── router_engine.py
├── intent_classifier.py
├── embedding_utils.py
├── prompt_linker.py
├── router_config.json
├── vector_index/
│   └── prompt_link_store.qdrant
└── logs/
    └── router_activity.log
```

---

## External Dependencies

- `transformers` – BERT/MiniLM for intent classification
- `langchain` – for chaining, vector recall, prompt templates
- `qdrant-client` – storing and querying past prompt links
- `openai`, `anthropic`, `ollama` – adapters for model endpoints
- `jsonschema`, `pydantic` – config validation

---

## Example Routing Flow

1. **User Input:**

   > "Can you summarize the latest earnings report from Tesla?"

2. **Intent Classification:**

   - Type: `summarize`
   - Language: `en`
   - Domain: `finance`
   - Sentiment: `neutral`

3. **Router Query Check:**

   - No existing prompt matches
   - Tokens estimated: 3,000 (full report)
   - User prefers local unless > 2k tokens

4. **LLM Selected:** `gpt-4-32k` (OpenAI, via API)

5. **Prompt Chain Created:**

   - System prompt: `financial-summary.v1`
   - Linked for downstream QA

6. **Result Stored:**

   - Embedding + hash → Qdrant
   - Output → linked to `Tesla-Earnings-2025Q2`

---

## Logging & Analytics

- Each routing decision is logged with:
  - Timestamp
  - Input hash
  - Route selected
  - Token estimate
  - Total response time
  - LLM success/failure
- Metrics exposed to Prometheus endpoint `/metrics/router`
- Daily summaries with:
  - Most used model
  - Top linked prompts
  - Failover statistics

---

## Security & Failover

- Sandboxed eval for local LLMs using `nsjail`
- Retry logic: up to 3 fallback attempts with exponential backoff
- Sensitive input detection → only local or encrypted tunnel models used
- Config-driven domain blocks (e.g., `finance` must use local)

---

## Future Enhancements

- **Federated Routing:** sharing embeddings between nodes
- **Trust Score System:** per-agent reliability feedback loop
- **Prompt Abstraction Tree:** for dynamic prompt construction
- **Context-Aware Caching:** reduce recomputation

---

## See Also

- `prompt_manager/`
- `agent_registry/`
- `runtime_context/`
- `secure_llm_gateway/`
- `vector_memory/`


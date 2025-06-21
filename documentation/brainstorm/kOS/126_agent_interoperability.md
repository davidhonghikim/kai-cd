# 126: Agent Interoperability & Foreign Protocol Adaptation Layer

This document defines the architectural structure and runtime implementation of the **Interoperability and Foreign Protocol Adaptation Layer** within `kOS` and `kAI`, allowing agents to interact with external AI agents, tools, software ecosystems, and protocols not natively designed for Kind OS.

---

## I. Purpose

To provide seamless interaction, negotiation, and cooperative execution between:

- kAI/kOS-native agents and external AI systems
- Agents operating under incompatible standards (e.g., OpenAI tools, LangChain agents, AutoGen, CrewAI)
- Remote services using external LLM protocols, containerized workflows, or plugin APIs

---

## II. Directory Structure

```text
/kind/core/interop/
├── protocols/
│   ├── openai_plugin_adapter.ts        # REST + JSON schema support
│   ├── autogen_adapter.ts              # CrewAI/AutoGen protocol adapter
│   ├── langchain_agent_bridge.py       # LangChain runtime compatibility
│   ├── klp_adapter.ts                  # Internal mapping to KLP objects
├── translators/
│   ├── prompt_adapter.ts               # Prompt format translator
│   ├── response_mapper.ts              # External ➝ internal response normalization
├── registry.ts                         # Known foreign systems and compatibility map
├── capabilities.ts                     # Feature matching and negotiation
├── runtime_hooks.ts                    # Lifecycle hooks for interop routing
```

---

## III. Foreign Protocol Compatibility Matrix

| Protocol/API    | Supported | Adapter Module           | Notes                          |
| --------------- | --------- | ------------------------ | ------------------------------ |
| OpenAI Plugin   | ✅         | `openai_plugin_adapter`  | Reads manifest, handles auth   |
| LangChain Agent | ✅         | `langchain_agent_bridge` | Uses async interface injection |
| CrewAI/AutoGen  | ✅         | `autogen_adapter`        | Interop via socket bridge      |
| OpenAPI3        | ⚠️        | `prompt_adapter`         | Partial support                |
| LlamaIndex      | 🔜        | planned                  |                                |
| Custom DSL      | ✅         | prompt injection hooks   | Internal mapping               |

---

## IV. Core Features

### 1. Dynamic Capability Mapping

- External agents' metadata is parsed and translated into kAI capability tokens
- Prevents feature mismatch or unsupported commands

### 2. Prompt & Response Normalization

- All prompts are wrapped in KLP-compatible objects
- Agent personality and execution context injected into external calls

### 3. Agent Proxy Router

- Supports delegation to external agents and re-injection of results
- Acts as trusted or semi-trusted proxy

### 4. Lifecycle Hooks

- `on_before_call`, `on_after_response`, `on_error`
- Can add metrics, logging, user-level filtering, or retry logic

---

## V. Configuration Schema

```yaml
interop:
  allow_external_agents: true
  foreign_agents:
    - id: "autogen_chatbot"
      adapter: "autogen_adapter"
      endpoint: "http://localhost:4000"
      allowed_calls:
        - "respond_to_user"
        - "get_tools"
    - id: "langchain_llm_agent"
      adapter: "langchain_agent_bridge"
      capabilities:
        translate: true
        chain_of_thought: true
```

---

## VI. Kind Link Protocol (KLP) Bridge

Adapters map foreign messages to the internal KLP schema:

### KLP Mappings:

- `klp.request.type = 'interop'`
- `klp.payload.foreign_type = 'plugin' | 'agent' | 'tool'`
- `klp.meta.origin = adapter_id`
- `klp.response.output = normalized string | json`

---

## VII. Security & Trust

- Each adapter can define **trust level** (sandbox, semi-trusted, admin-only)
- Prompts from untrusted agents are auto-redacted
- Rate-limiting and call quotas for external API calls
- Signed adapter configs for critical system agents

---

## VIII. Use Cases

- Allow user to interact with CrewAI remote agent from local kAI GUI
- Import OpenAI-compatible prompt plugins into Prompt Manager
- Delegate chained queries to LangChain + RAG hybrid agent
- Normalize vector search results from Weaviate plugin tools

---

## IX. Future Work

- WASM-based protocol adapters
- Zero-trust sandbox for unknown agent interfaces
- GUI adapter configurator
- LLM-powered auto-mapping for unknown schemas

---

### Changelog

– 2025-06-21 • Initial interop protocol layer design complete


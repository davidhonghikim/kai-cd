# 149: Kind Agent Interface Layer (KAIL) – Agent Communication and Invocation Bus

This document specifies the structure, responsibilities, message formats, and integration layers for the **Kind Agent Interface Layer (KAIL)**, the universal communication fabric for all local and remote `kAI` agents across `kOS`.

KAIL serves as the low-latency, modular message bus and protocol bridge between agents, plugins, services, interfaces, and the orchestration layer.

---

## I. Goals

- Define a standardized interface for invoking agents (LLM or script-based)
- Support asynchronous, streaming, and batched message formats
- Ensure secure, extensible, and traceable interactions
- Support remote agents over KLP (Kind Link Protocol) and local IPC or API
- Allow flexible plugin injection, agent swapping, and agent chaining

---

## II. Key Concepts

| Concept                   | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `AgentInvocation`         | A JSON payload specifying agent, intent, context, and parameters  |
| `AgentEnvelope`           | Signed, trackable message wrapper for invocation and response     |
| `AgentInterfaceAdapter`   | Middleware that translates between external tools and KAIL format |
| `InvocationStack`         | Tracks full pipeline of agent-to-agent hops, inputs, and outputs  |
| `Kind Agent Handle (KAH)` | Universally addressable handle (local or remote)                  |
| `KAIL Protocol`           | Messaging format and validation rules                             |

---

## III. Directory & File Structure

```text
/core/kail/
├── agents/
│   ├── base_agent.py
│   ├── llm_agent.py
│   ├── plugin_agent.py
│   └── shell_agent.py
├── interface/
│   ├── adapter_openai.py
│   ├── adapter_llamacpp.py
│   ├── adapter_webhook.py
│   └── adapter_customapi.py
├── protocols/
│   ├── kail_schema.json
│   ├── klp_transport.py
│   ├── local_ipc.py
│   └── http_bridge.py
├── utils/
│   ├── invocation_tracker.py
│   ├── validator.py
│   └── envelope.py
├── kail_router.py
├── kail_bus.py
└── kail_config.yaml
```

---

## IV. Message Format: AgentEnvelope

```json
{
  "type": "AgentInvocation",
  "version": "1.0",
  "id": "bfa81c3e-7123-42a0-9c65-778fc923fca3",
  "sender": "kah:agent.local.user.001",
  "target": "kah:agent.local.notetaker",
  "intent": "summarize_document",
  "payload": {
    "input": "long_text_here",
    "options": {
      "model": "gpt-4-turbo",
      "temperature": 0.3
    }
  },
  "context": {
    "thread_id": "doc-session-8431",
    "timestamp": "2025-06-21T14:33:52Z"
  },
  "signature": "base64-encoded-signature"
}
```

---

## V. Agent Adapter Examples

### OpenAI-Compatible LLM Adapter

```python
class OpenAIAdapter(AgentInterfaceAdapter):
    def invoke(self, invocation):
        # Transform to OpenAI API format
        payload = self.transform(invocation)
        result = requests.post("https://api.openai.com/v1/chat/completions", json=payload)
        return result.json()
```

### Webhook Adapter

```python
class WebhookAdapter(AgentInterfaceAdapter):
    def invoke(self, invocation):
        url = self.map_kah_to_url(invocation.target)
        resp = requests.post(url, json=invocation.payload)
        return resp.json()
```

---

## VI. Routing Logic

Routing logic is implemented in `kail_router.py`. It:

- Resolves `KAH` to local/remote targets
- Validates message via `kail_schema.json`
- Handles retries and timeouts
- Triggers tracing hooks and logs invocation stack

---

## VII. Config Example: `kail_config.yaml`

```yaml
kail:
  enabled: true
  transport:
    - local_ipc
    - klp_transport
    - http_bridge
  default_agent_model: gpt-4-turbo
  logging: true
  trace_stack: true
  retries: 2
  timeout: 10
```

---

## VIII. Security

- Signed envelopes with local/remote keys
- Optional encrypted payloads using AES or KMS integration
- Role-based permissions for agent-to-agent calls
- Replay attack protection using nonce & TTL

---

## IX. Integration with kOS

- **Discovery:** Agents register with local service registry
- **Broadcasts:** Global announcements via KLP for meta-agent events
- **Audit:** Invocation chains stored in append-only logs
- **Fallbacks:** If agent fails, reroute to backup agent pool

---

### Changelog

– 2025-06-21 • Initial KAIL transport + interface spec


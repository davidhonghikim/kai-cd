# 145: Inference-Oriented Agent Design (IOAD)

This document defines the architecture, principles, and patterns for designing and deploying agents in the `kAI` ecosystem that are optimized for fast, scalable, and reliable inference, across a variety of contexts including edge, mobile, swarm, and cloud.

---

## I. Purpose and Scope

IOAD enables the creation of agents that:

- Deliver fast inference with minimal latency
- Optimize GPU, CPU, and accelerator usage
- Separate inference paths from planning/evaluation paths
- Are stateless or memory-minimal for efficiency
- Support streaming and chunked response generation
- Can run on mobile, embedded, and constrained environments

IOAD is used in:

- Real-time assistants
- Multi-agent decision trees
- Modal routing systems
- Resource-constrained field deployments

---

## II. Architectural Principles

### A. Stateless by Default

- Avoid long-term memory during inference
- Offload context to external context providers (e.g. vector store or session cache)
- Use token-efficient prompts with system injection

### B. Response Pipelining

- Chunk response generation into streaming outputs
- Use `onToken` hooks to drive downstream processors

### C. Modular Logic Separation

- Split agent logic into:
  - `setup()` – pre-inference setup
  - `runInference()` – pure prompt → response
  - `postProcess()` – output enrichment or formatting

### D. Multi-Modal Routing

- Based on prompt type, route to the best model:

```json
{
  "route": {
    "type": "classification",
    "options": ["openai:gpt-4", "ollama:phi3", "llama.cpp:mistral"]
  }
}
```

- Or use a dynamic strategy agent to determine the optimal route

### E. Hardware-Aware Agents

- Detect runtime environment
- Adjust inference parameters (e.g., model size, quantization, batching)

---

## III. Standard IOAD Agent Template

```ts
export const inferenceAgent = defineAgent({
  id: 'summarizer-infer',
  mode: 'inference',

  setup(ctx) {
    return {
      context: ctx.store.getRelevantDocs(ctx.input.text),
    }
  },

  async runInference({ input, context }) {
    const prompt = `Summarize this text:
${context}\n${input.text}`

    return callModel({
      provider: 'ollama',
      model: 'mistral',
      prompt,
      stream: true,
    })
  },

  postProcess(output) {
    return output.trim()
  },
})
```

---

## IV. Prompt Compression and Streaming

- Use prompt compressors (`PromptCompressAgent`) to reduce token cost
- Include agents that:
  - Truncate irrelevant portions
  - Token-limit reduction
  - Intent-focused summarizers

### Streaming Settings:

```ts
callModel({
  stream: true,
  onToken(token) {
    streamOut(token)
  }
})
```

---

## V. Edge Deployment Considerations

- Use `gguf`-format quantized models for LLMs on device

- Prefer fast runtime engines:

  - `llama.cpp`
  - `ggml`
  - `vLLM`
  - `Triton`

- Memory targets:

  - Under 2GB: `phi3-mini`, `mistral 4bit`
  - Under 500MB: Tiny models or distilled tools

---

## VI. Configuration

### Agent YAML:

```yaml
mode: inference
stream: true
hardware_aware: true
compression_enabled: true
prompt_template: "summarize"
model_routing:
  rules:
    - match: input.length > 400
      model: gpt-4
    - match: input.length <= 400
      model: mistral-7b-instruct
```

---

## VII. Performance Monitoring

- Log inference latency, throughput, token count
- Maintain cache of prior completions to reduce duplication
- Use rolling average monitors to auto-tune agents

---

## VIII. Known Pitfalls

| ❌ Issue               | 💡 Solution                                      |
| --------------------- | ------------------------------------------------ |
| Slow startup          | Use warmed container pools                       |
| Repetitive output     | Use `antiPatternChecker()` post hooks            |
| Overloaded edge nodes | Load balance via local peer mesh                 |
| Model mismatch        | Enforce `model signature hash` check before load |

---

## IX. Extensions

- **Cascade Agents:** Chain several IOAD agents for multi-stage processing
- **Fallbacks:** Register light model fallbacks if inference fails or exceeds timeout
- **Zero-copy Context Fetching:** Use shared memory regions for embedding recall on-device

---

### Changelog

– 2025-06-22 • Initial draft of IOAD agent architecture for Kind ecosystem

---

Next planned doc: **146: Multi-Agent Task Graph Compiler (MATGC)** – architecture and agent workflow compiler for auto-linking complex behaviors.


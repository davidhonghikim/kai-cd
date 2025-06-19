# 💬 07: Services - LLM / Chat

This document details the specifics of integrating Large Language Model (LLM) and chat-based services into Kai-CD.

## Core Capability: `llm_chat`

The primary capability for these services is `llm_chat`. A service definition that includes this capability can be used in the application's chat interfaces.

### `llm_chat` Capability Schema

- `capability`: Must be the string `'llm_chat'`.
- `endpoints`:
    - `chat`: The primary endpoint for sending chat messages.
    - `getModels` (optional): An endpoint that returns a list of available models.
- `parameters`:
    - A standardized set of parameters should be used for UI consistency.
    - `model`: The specific model to use (e.g., `llama3`, `gpt-4o`).
    - `messages`: The conversation history (managed by the application).
    - `temperature`: Controls the randomness of the response.
    - `top_p`: Controls nucleus sampling.
    - `max_tokens`: The maximum number of tokens to generate.
    - `stream`: Whether to stream the response. The UI will prefer this to be `true`.

## Example: Ollama

The `ollama.ts` service definition is the primary reference implementation for this category.

### Ollama API

- Chat Endpoint: `POST /api/chat`
- List Models Endpoint: `GET /api/tags`

### `ollama.ts` Definition (High-Level)

```typescript
// src/connectors/definitions/ollama.ts
import type { ServiceDefinition, LlmChatCapability } from '../../types';

const llmChatCapability: LlmChatCapability = {
    capability: 'llm_chat',
    endpoints: {
        chat: { path: '/api/chat', method: 'POST' },
        getModels: { path: '/api/tags', method: 'GET' }
    },
    parameters: {
        // Parameter definitions for model, temperature, etc.
        // The 'model' parameter's options are dynamically populated
        // by calling the 'getModels' endpoint.
    }
};

export const ollamaDefinition: ServiceDefinition = {
    type: 'ollama',
    name: 'Ollama',
    // ... other properties
    capabilities: [llmChatCapability]
};
```

This structure allows the UI to fetch available models, construct a request with the correct parameters, and render a consistent chat interface for any service that implements `llm_chat`. 
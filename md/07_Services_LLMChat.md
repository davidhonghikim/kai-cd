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

The LLM Chat capability provides a native chat interface within the extension for interacting with compatible language model APIs (like OpenAI, Ollama, etc.).

## Features

- **Streaming Responses**: Messages stream in token-by-token for a real-time feel.
- **Markdown & Code Support**: Responses are rendered as Markdown, with syntax highlighting for code blocks.
- **Parameter Control**: A sidebar allows for on-the-fly adjustment of API parameters like temperature, top_p, etc.
- **History Management**: Chat history is stored per-service in the `serviceStore` and can be cleared by the user.

## Component Architecture

The chat interface is composed of several key components:

- **`LlmChatView.tsx`**: The main container component. It orchestrates the other components and manages the overall state of the chat session, including the message history and the connection to the `serviceStore`.
- **`ChatMessageList.tsx`**: Renders the list of messages. It takes the array of messages and an `isLoading` flag to display a typing indicator.
- **`ChatInputForm.tsx`**: The text input area and send button. It handles user input and triggers the `handleSubmit` function in the parent view.
- **`ModelSelector.tsx`**: A dropdown that appears in the header, allowing the user to switch between available models for the current service. It fetches the model list from the appropriate API endpoint defined in the service's capability definition.
- **`ParameterControl.tsx`**: A generic component that renders the correct UI (slider, switch, etc.) for a given API parameter definition.

## Data Flow

1.  User types a message in `ChatInputForm` and hits send.
2.  `LlmChatView`'s `handleSubmit` function is called.
3.  A "user" message is added to the local state, and an empty "assistant" message is added to show a placeholder.
4.  An API call is made to the service's chat endpoint using `apiClient.postStream`. The payload includes the current message history and any adjusted parameters.
5.  As the streaming response arrives, the `handleStreamedResponse` function continuously updates the content of the assistant's message in the local state.
6.  `ChatMessageList` re-renders to display the incoming tokens.
7.  The user can select a new model via `ModelSelector`. This updates the component's form state and also calls `updateServiceLastUsedModel` in the `serviceStore` to persist the choice for the next session.
8.  The user can adjust parameters in the sidebar, which updates the form state that will be used for the next API request. 
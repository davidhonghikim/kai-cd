import type { ServiceDefinition, LlmChatCapability, ModelManagementCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const llmChatCapability: LlmChatCapability = {
  capability: 'llm_chat',
  endpoints: {
    chat: { path: '/api/chat/completions', method: 'POST' },
  },
  parameters: {
    chat: [
      {
        key: 'model',
        label: 'Model',
        type: 'string',
        defaultValue: '',
        description: 'The ID of the model to use for this request.',
        optionsEndpoint: '/api/models',
        optionsPath: 'models',
        optionsValueKey: 'name',
        optionsLabelKey: 'name',
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.7,
        range: [0, 2],
        step: 0.1,
        description: 'Controls randomness. Lowering results in less random completions.',
      },
      {
        key: 'top_p',
        label: 'Top P',
        type: 'number',
        defaultValue: 1,
        range: [0, 1],
        step: 0.1,
        description: 'The cumulative probability of tokens to consider for sampling.',
      },
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 2048,
        description: 'The maximum number of tokens to generate.',
      },
      {
        key: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: null,
        description: 'A seed for deterministic sampling.',
      },
    ],
  },
};

const modelManagementCapability: ModelManagementCapability = {
  capability: 'model_management',
  endpoints: {
    list: { path: '/api/models', method: 'GET' },
  },
  parameters: {
    list: [],
  },
};

const OpenWebUIDefinition: ServiceDefinition = {
  type: 'open-webui',
  name: 'Open WebUI',
  category: SERVICE_CATEGORIES.LLM,
  hasExternalUi: true,
  docs: {
    api: 'https://docs.openwebui.com/getting-started/api-endpoints/',
  },
  authentication: {
    type: 'bearer_token',
  },
  // Note: Open WebUI also has a RAG API for file uploads and knowledge bases
  // which could be mapped to a future 'RAGCapability'.
  // Endpoints: POST /api/v1/files/ for upload.
  capabilities: [llmChatCapability, modelManagementCapability],
  defaultPort: 8080,
};

export { OpenWebUIDefinition as openWebUIDefinition }; 
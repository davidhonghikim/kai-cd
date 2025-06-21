import type { ServiceDefinition, LlmChatCapability, ModelManagementCapability, HealthCapability, StorageCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const healthCapability: HealthCapability = {
  capability: 'health',
  endpoints: {
    health: { path: '/health', method: 'GET' }
  }
};

const llmChatCapability: LlmChatCapability = {
  capability: 'llm_chat',
  endpoints: {
    chat: { path: '/v1/chat/completions', method: 'POST' },
  },
  parameters: {
    chat: [
      {
        key: 'model',
        label: 'Model',
        type: 'string',
        defaultValue: config.services.defaultOpenWebUIModel,
        description: 'The ID of the model to use for this request.',
        optionsEndpoint: 'getModels',
        optionsPath: 'data',
        optionsValueKey: 'id',
        optionsLabelKey: 'id',
      },
      {
        key: 'system_prompt',
        label: 'System Prompt',
        type: 'string',
        defaultValue: 'You are a helpful assistant.',
        description: 'The system prompt to guide the model\'s behavior.',
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
    getModels: { path: '/v1/models', method: 'GET' },
  },
  parameters: {
    getModels: [],
  },
};

// Placeholder for future RAG (Retrieval-Augmented Generation) capabilities
const storageCapability: StorageCapability = {
  capability: 'storage',
  endpoints: {
    uploadFile: { path: '/api/v1/files/', method: 'POST' }
  },
  parameters: {}
};

export const openWebUIDefinition: ServiceDefinition = {
  type: 'open-webui',
  name: 'Open WebUI',
  category: SERVICE_CATEGORIES.LLM_CHAT,
  hasExternalUi: true,
  defaultPort: 3000,
  docs: {
    api: 'https://docs.openwebui.com/api/openai'
  },
  // Note: Open WebUI also has a RAG API for file uploads and knowledge bases
  // which could be mapped to a future 'RAGCapability'.
  // Endpoints: POST /api/v1/files/ for upload.
  authentication: {
    type: 'bearer_token',
    help: 'Get the JWT token from your browser after logging into Open WebUI (see Developer Tools > Network > Authorization header)'
  },  capabilities: [llmChatCapability, modelManagementCapability, storageCapability, healthCapability],
}; 
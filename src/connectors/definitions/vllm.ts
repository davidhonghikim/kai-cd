import type { ServiceDefinition, LlmChatCapability, ParameterDefinition, HealthCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const healthCapability: HealthCapability = {
  capability: 'health',
  endpoints: {
    health: { path: '/v1/models', method: 'GET' }
  }
};

const llmChatParameters: ParameterDefinition[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'select',
    defaultValue: config.services.defaultOpenAICompatibleModel,
    description: 'The model to use for the chat.',
    optionsEndpoint: 'getModels',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    type: 'number',
    defaultValue: 0.8,
    range: [0, 2],
    step: 0.1,
    description: 'Controls randomness: lowering results in less random completions.',
  },
  {
    key: 'top_p',
    label: 'Top P',
    type: 'number',
    defaultValue: 0.9,
    range: [0, 1],
    step: 0.05,
    description: 'The cumulative probability of tokens to consider for sampling.',
  },
];

const llmChatCapability: LlmChatCapability = {
  capability: 'llm_chat',
  endpoints: {
    chat: { path: '/v1/chat/completions', method: 'POST' },
    getModels: { path: '/v1/models', method: 'GET' },
  },
  parameters: {
    chat: llmChatParameters,
  },
};

export const vllmDefinition: ServiceDefinition = {
  type: 'vllm',
  name: 'vLLM',
  category: SERVICE_CATEGORIES.LLM,
  defaultPort: 8000,
  docs: {
    api: 'https://docs.vllm.ai/en/latest/getting_started/quickstart.html#openai-compatible-server',
  },
  authentication: {
    type: 'bearer_token',
    defaultValue: config.services.defaultOpenAICompatibleKey
  },
  configuration: {
    arguments: {
      host: {
        flag: '--host 0.0.0.0',
        description: 'Binds the server to all available network interfaces.',
        required: true,
      },
    },
    help: {
      instructions: 'Start the vLLM server with the specified model and arguments.',
    },
  },
  capabilities: [llmChatCapability, healthCapability],
}; 
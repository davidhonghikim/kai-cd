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
    defaultValue: 0.7,
    range: [0, 2],
    step: 0.1,
    description: 'Controls randomness. Higher values make the output more random.'
  },
  {
    key: 'top_p',
    label: 'Top P',
    type: 'number',
    defaultValue: 0.95,
    range: [0, 1],
    step: 0.05,
    description: 'Nucleus sampling. The model considers the results of the tokens with top_p probability mass.'
  },
  {
    key: 'max_tokens',
    label: 'Max Tokens',
    type: 'number',
    defaultValue: -1,
    description: 'The maximum number of tokens to generate. -1 for unlimited.'
  },
  {
    key: 'seed',
    label: 'Seed',
    type: 'number',
    defaultValue: -1,
    description: 'Seed for random number generation. -1 for random.'
  }
];

const llmChatCapability: LlmChatCapability = {
  capability: 'llm_chat',
  endpoints: {
    chat: { path: '/v1/chat/completions', method: 'POST' },
    getModels: { path: '/v1/models', method: 'GET' },
  },
  parameters: {
    chat: llmChatParameters
  }
};

export const llmStudioDefinition: ServiceDefinition = {
  type: 'llm-studio',
  name: 'LM Studio',
  category: SERVICE_CATEGORIES.LLM,
  defaultPort: 1234,
  docs: {
    api: 'https://lmstudio.ai/docs/local-server',
  },
  authentication: {
    type: 'bearer_token',
    defaultValue: config.services.defaultOpenAICompatibleKey
  },
  configuration: {
    help: {
      instructions: 'Start the server from the LM Studio UI (Local Server tab).',
    },
  },
  capabilities: [llmChatCapability, healthCapability],
}; 
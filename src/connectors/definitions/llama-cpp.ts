import type { ServiceDefinition, LlmChatCapability, HealthCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const llmChatParameters: ParameterDefinition[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'select',
    defaultValue: config.services.defaultOpenAICompatibleModel,
    description: 'The model to use for the chat.',
    optionsEndpoint: 'getModels',
    optionsPath: 'data',
    optionsValueKey: 'id',
    optionsLabelKey: 'id'
  },
  {
    key: 'temperature',
    label: 'Temperature',
    type: 'number',
    defaultValue: 0.8,
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
    key: 'top_k',
    label: 'Top K',
    type: 'number',
    defaultValue: 40,
    range: [0, 100],
    step: 1,
    description: 'The number of highest probability vocabulary tokens to keep for top-k-filtering.'
  },
  {
    key: 'max_tokens',
    label: 'Max Tokens',
    type: 'number',
    defaultValue: 2048,
    description: 'The maximum number of tokens to generate in the completion.'
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

const healthCapability: HealthCapability = {
  capability: 'health',
  endpoints: {
    health: { path: '/health', method: 'GET' }
  }
};

const LlamaCppDefinition: ServiceDefinition = {
  type: 'llama-cpp',
  name: 'Llama.cpp',
  category: SERVICE_CATEGORIES.LLM,
  docs: {
    api: 'https://github.com/abetlen/llama-cpp-python#openai-compatible-web-server'
  },
  authentication: {
    type: 'bearer_token'
  },
  capabilities: [llmChatCapability, healthCapability],
  defaultPort: 8000
};

export const llamaCppDefinition: ServiceDefinition = LlamaCppDefinition; 
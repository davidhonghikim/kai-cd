import type { ServiceDefinition, LlmChatCapability, HealthCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const healthCapability: HealthCapability = {
  capability: 'health',
  endpoints: {
    health: { path: '/v1/models', method: 'GET' }
  }
};

const llmChatCapability: LlmChatCapability = {
  capability: 'llm_chat',
  endpoints: {
    chat: { path: '/v1/chat/completions', method: 'POST' },
    getModels: { path: '/v1/models', method: 'GET' },
  },
  parameters: {
    chat: [
      {
        key: 'model',
        label: 'Model',
        type: 'string',
        defaultValue: config.services.defaultOpenAICompatibleModel,
        description: 'The ID of the model to use for this request.',
        optionsEndpoint: '/v1/models',
        optionsPath: 'data',
        optionsValueKey: 'id',
        optionsLabelKey: 'id'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.7,
        description:
          'Controls randomness. Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
        range: [0, 2],
        step: 0.1
      },
      {
        key: 'top_p',
        label: 'Top P',
        type: 'number',
        defaultValue: 1,
        description:
          'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.',
        range: [0, 1],
        step: 0.1
      },
      {
        key: 'max_tokens',
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 2048,
        description: 'The maximum number of tokens to generate. Requests can use up to 4096 tokens shared between prompt and completion.'
      },
      {
        key: 'presence_penalty',
        label: 'Presence Penalty',
        type: 'number',
        defaultValue: 0,
        description:
          'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
        range: [-2, 2],
        step: 0.1
      },
      {
        key: 'frequency_penalty',
        label: 'Frequency Penalty',
        type: 'number',
        defaultValue: 0,
        description:
          'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
        range: [-2, 2],
        step: 0.1
      },
      {
        key: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: null,
        description: 'If specified, the system will make a best effort to sample deterministically.'
      }
    ]
  }
};

export const openAICompatibleDefinition: ServiceDefinition = {
  type: 'openai-compatible',
  name: 'OpenAI-Compatible',
  category: SERVICE_CATEGORIES.LLM,
  defaultPort: 8000,
  docs: {
    api: 'https://platform.openai.com/docs/api-reference/chat'
  },
  configuration: {
    help: {
      instructions:
        'Provide the base URL of the OpenAI-compatible API and an API key if required.'
    }
  },
  authentication: {
    type: 'bearer_token'
  },
  capabilities: [llmChatCapability, healthCapability]
}; 
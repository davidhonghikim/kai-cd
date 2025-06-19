import type { ServiceDefinition, LlmChatCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const llmChatParameters: ParameterDefinition[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'string',
    defaultValue: 'unspecified',
    description: 'The model to use. Note: In LM Studio, the model is loaded via the UI and this parameter is ignored.'
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
    chat: { path: '/v1/chat/completions', method: 'POST' }
  },
  parameters: {
    chat: llmChatParameters
  }
};

const LlmStudioDefinition: ServiceDefinition = {
  type: 'llm-studio',
  name: 'LM Studio',
  category: SERVICE_CATEGORIES.LLM,
  docs: {
    api: 'https://lmstudio.ai/docs/local-server'
  },
  authentication: {
    type: 'none'
  },
  capabilities: [llmChatCapability],
  defaultPort: 1234
};

export default LlmStudioDefinition; 
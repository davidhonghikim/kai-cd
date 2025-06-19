import type { ServiceDefinition, LlmChatCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const llmChatParameters: ParameterDefinition[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'string',
    defaultValue: 'mistralai/Mistral-7B-Instruct-v0.1',
    description: 'The model to use for the chat. This is often specified when launching the vLLM server.',
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
    type: 'none',
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
  capabilities: [llmChatCapability],
}; 
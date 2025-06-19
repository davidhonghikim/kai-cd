import type { ServiceDefinition, LlmChatCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const llmChatParameters: ParameterDefinition[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'string',
    defaultValue: 'unspecified',
    description: 'The model to use. For vLLM, this is typically set at server startup.'
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
    defaultValue: 1.0,
    range: [0, 1],
    step: 0.05,
    description: 'Nucleus sampling. The model considers the results of the tokens with top_p probability mass.'
  },
  {
    key: 'max_tokens',
    label: 'Max Tokens',
    type: 'number',
    defaultValue: 1024,
    description: 'The maximum number of tokens to generate in the completion.'
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

const VllmDefinition: ServiceDefinition = {
  type: 'vllm',
  name: 'vLLM',
  category: SERVICE_CATEGORIES.LLM,
  docs: {
    api: 'https://docs.vllm.ai/en/latest/openai_compat.html'
  },
  authentication: {
    type: 'none'
  },
  capabilities: [llmChatCapability],
  defaultPort: 8000
};

export default VllmDefinition; 
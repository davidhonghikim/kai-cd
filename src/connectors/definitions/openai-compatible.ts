import type { ServiceDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

export const openAICompatibleDefinition: ServiceDefinition = {
  type: 'openai-compatible',
  name: 'OpenAI-Compatible',
  category: SERVICE_CATEGORIES.LLM,
  defaultPort: 8000,
  isCorsCompliant: true,
  endpoints: {
    getModels: { path: '/v1/models', method: 'GET' },
    chat: { path: '/v1/chat/completions', method: 'POST' },
  },
  configuration: {},
}; 
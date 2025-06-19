import type { ServiceDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

export const openWebUIDefinition: ServiceDefinition = {
  type: 'open-webui',
  name: 'Open WebUI',
  category: SERVICE_CATEGORIES.LLM,
  defaultPort: 8080,
  isCorsCompliant: true,
  endpoints: {
    getModels: { path: '/api/v1/models', method: 'GET' },
    chat: { path: '/api/v1/chat/completions', method: 'POST' },
  },
  configuration: {},
}; 
import { SERVICE_TYPES, SERVICE_CATEGORIES } from './constants';
import type { Service } from '@/types';

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'local',
    name: 'Local Ollama',
    type: SERVICE_TYPES.OLLAMA,
    url: 'http://localhost:11434',
    enabled: true,
    status: 'active',
    category: SERVICE_CATEGORIES.LLM,
    requiresApiKey: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true
  },
  {
    id: 'remote',
    name: 'Remote Ollama',
    type: SERVICE_TYPES.OLLAMA,
    url: 'http://remote:11434',
    enabled: false,
    status: 'inactive',
    category: SERVICE_CATEGORIES.LLM,
    requiresApiKey: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false
  }
]; 
import { openAICompatibleDefinition } from './openai-compatible';
import type { ServiceDefinition } from '../../types';

export const llamaCppDefinition: ServiceDefinition = {
  ...openAICompatibleDefinition,
  type: 'llama-cpp',
  name: 'Llama.cpp',
  defaultPort: 8080,
}; 
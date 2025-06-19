import { openAICompatibleDefinition } from './openai-compatible';
import type { ServiceDefinition } from '../../types';

export const vllmDefinition: ServiceDefinition = {
  ...openAICompatibleDefinition,
  type: 'vllm',
  name: 'vLLM',
  defaultPort: 8000,
}; 
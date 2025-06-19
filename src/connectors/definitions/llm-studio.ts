import { openAICompatibleDefinition } from './openai-compatible';
import type { ServiceDefinition } from '../../types';

export const llmStudioDefinition: ServiceDefinition = {
  ...openAICompatibleDefinition,
  type: 'llm-studio',
  name: 'LM Studio',
  defaultPort: 1234,
}; 
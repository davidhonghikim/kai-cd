import type { ServiceDefinition, LlmChatCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const chatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: '',
		description: 'The model to use for the chat.',
		optionsEndpoint: 'getModels',
		optionsPath: 'models',
		optionsValueKey: 'name',
		optionsLabelKey: 'name'
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 0.8,
		range: [0, 2],
		step: 0.1,
		description: 'Controls randomness: lowering results in less random completions.'
	},
	{
		key: 'top_p',
		label: 'Top P',
		type: 'number',
		defaultValue: 0.9,
		range: [0, 1],
		step: 0.05,
		description: 'The cumulative probability of tokens to consider for sampling.'
	},
	{
		key: 'seed',
		label: 'Seed',
		type: 'number',
		defaultValue: 42,
		description: 'The random seed for the generation, for reproducibility.'
	}
];

const llmChatCapability: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		getModels: { path: '/api/tags', method: 'GET' },
		chat: { path: '/api/chat', method: 'POST' }
	},
	parameters: {
		chat: chatParameters
	}
};

export const ollamaDefinition: ServiceDefinition = {
	type: 'ollama',
	name: 'Ollama',
	category: SERVICE_CATEGORIES.LLM,
	defaultPort: 11434,
	docs: {
		api: 'https://github.com/ollama/ollama/blob/main/docs/api.md'
	},
	authentication: {
		type: 'none'
	},
	configuration: {
		help: {
			instructions: 'Ollama should work out-of-the-box if it is running on the specified host and port.'
		}
	},
	capabilities: [llmChatCapability]
}; 
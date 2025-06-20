import type { ServiceDefinition, LlmChatCapability, ParameterDefinition, HealthCapability, ModelManagementCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const chatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: config.services.defaultOllamaModel,
		description: 'The model to use for the chat.',
		optionsEndpoint: 'getModels',
		optionsPath: 'models',
		optionsValueKey: 'name',
		optionsLabelKey: 'name'
	},
	{
		key: 'system_prompt',
		label: 'System Prompt',
		type: 'string',
		defaultValue: 'You are a helpful assistant.',
		description: 'The system prompt to guide the model\'s behavior.',
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
		key: 'top_k',
		label: 'Top K',
		type: 'number',
		defaultValue: 40,
		range: [0, 100],
		step: 1,
		description: 'Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative.'
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
		key: 'repeat_penalty',
		label: 'Repeat Penalty',
		type: 'number',
		defaultValue: 1.1,
		range: [0, 2],
		step: 0.05,
		description: 'A higher value (e.g., 1.5) will penalize repetitions more strongly, making the model less likely to repeat itself.'
	},
	{
		key: 'num_predict',
		label: 'Max Tokens (num_predict)',
		type: 'number',
		defaultValue: -1,
		description: 'The maximum number of tokens to generate. -1 for infinite.'
	},
	{
		key: 'stop',
		label: 'Stop Sequences',
		type: 'string',
		defaultValue: '',
		description: 'A comma-separated list of tokens to stop generation at (e.g., "AI:, Human:").'
	},
	{
		key: 'seed',
		label: 'Seed',
		type: 'number',
		defaultValue: 42,
		description: 'The random seed for the generation, for reproducibility.'
	}
];

const healthCapability: HealthCapability = {
	capability: 'health',
	endpoints: {
		health: { path: '/', method: 'GET' }
	}
};

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

const modelManagementCapability: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		getModels: { path: '/api/tags', method: 'GET' },
		copyModel: { path: '/api/copy', method: 'POST' },
		deleteModel: { path: '/api/delete', method: 'DELETE' },
		pullModel: { path: '/api/pull', method: 'POST' },
	},
	parameters: {},
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
	capabilities: [llmChatCapability, healthCapability, modelManagementCapability]
}; 
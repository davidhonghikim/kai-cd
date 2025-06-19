import type {
	ServiceDefinition,
	LlmChatCapability,
	ModelManagementCapability,
	ParameterDefinition
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const models: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		list: {
			path: '/v1/models',
			method: 'GET'
		}
	},
	parameters: {}
};

const chatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: 'claude-3-haiku-20240307',
		description: 'The model that will complete your prompt.',
		optionsEndpoint: 'list',
		optionsPath: 'data',
		optionsValueKey: 'id',
		optionsLabelKey: 'id'
	},
	{
		key: 'max_tokens',
		label: 'Max Tokens',
		type: 'number',
		defaultValue: 1024,
		description: 'The maximum number of tokens to generate before stopping.',
		range: [1, 4096],
		step: 1
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 1.0,
		description: 'Amount of randomness injected into the response.',
		range: [0.0, 1.0],
		step: 0.01
	},
	{
		key: 'top_p',
		label: 'Top P',
		type: 'number',
		defaultValue: 1.0,
		description:
			'Use nucleus sampling. In nucleus sampling, we compute the cumulative distribution over all the options for each subsequent token in decreasing probability order and cut it off once it reaches a particular probability specified by top_p.',
		range: [0.0, 1.0],
		step: 0.01
	},
	{
		key: 'top_k',
		label: 'Top K',
		type: 'number',
		defaultValue: 5,
		description: 'Only sample from the top K options for each subsequent token.',
		range: [0, 100],
		step: 1
	},
	{
		key: 'stream',
		label: 'Stream',
		type: 'boolean',
		defaultValue: true,
		description: 'Whether to incrementally stream the response using server-sent events.'
	}
];

const LlmChat: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		chat: {
			path: '/v1/messages',
			method: 'POST'
		}
	},
	parameters: {
		chat: chatParameters
	}
};

export const anthropicDefinition: ServiceDefinition = {
	type: 'anthropic',
	name: 'Anthropic',
	category: SERVICE_CATEGORIES.LLM,
	defaultPort: 443,
	docs: {
		api: 'https://docs.anthropic.com/en/api/messages'
	},
	headers: {
		'anthropic-version': '2023-06-01'
	},
	authentication: {
		type: 'api_key',
		keyName: 'x-api-key',
		help: 'Get your API key from the Anthropic Console.'
	},
	capabilities: [LlmChat, models]
}; 
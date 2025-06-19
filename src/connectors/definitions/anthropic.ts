import type { ServiceDefinition, LlmChatCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const chatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: 'claude-3-haiku-20240307',
		description: 'The model to use for the chat.',
		optionsEndpoint: 'getModels',
		optionsPath: 'data',
		optionsValueKey: 'id',
		optionsLabelKey: 'id'
	},
	{
		key: 'system',
		label: 'System Prompt',
		type: 'string',
		defaultValue: '',
		description:
			'A system prompt is a way of providing context and instructions to Claude, such as specifying a particular goal or role.'
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 1,
		range: [0, 1],
		step: 0.1,
		description: 'Amount of randomness injected into the response. Defaults to 1.0.'
	},
	{
		key: 'max_tokens',
		label: 'Max Tokens',
		type: 'number',
		defaultValue: 4096,
		range: [1, 4096],
		step: 8,
		description: 'The maximum number of tokens to generate.'
	},
	{
		key: 'stream',
		label: 'Stream',
		type: 'boolean',
		defaultValue: true,
		description: 'Whether to stream back partial progress.'
	}
];

const llmChatCapability: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		getModels: {
			path: '/v1/models',
			method: 'GET'
		},
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
	authentication: {
		type: 'api_key',
		keyName: 'x-api-key',
		help: 'You can find your Anthropic API key on your API keys page.'
	},
	headers: {
		'anthropic-version': '2023-06-01'
	},
	capabilities: [llmChatCapability],
	configuration: {
		help: {
			instructions: 'Simply add your API key to connect to the Anthropic API.'
		}
	}
}; 
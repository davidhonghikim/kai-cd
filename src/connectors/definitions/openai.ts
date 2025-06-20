import type {
	ServiceDefinition,
	LlmChatCapability,
	ParameterDefinition,
	LangChainCapability
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const chatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: config.services.defaultOpenAiModel,
		description: 'The model to use for the chat.',
		optionsEndpoint: 'getModels',
		optionsPath: 'data',
		optionsValueKey: 'id',
		optionsLabelKey: 'id'
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 1,
		range: [0, 2],
		step: 0.1,
		description: 'Controls randomness: Lowering results in less random completions.'
	},
	{
		key: 'top_p',
		label: 'Top P',
		type: 'number',
		defaultValue: 1,
		range: [0, 1],
		step: 0.05,
		description: 'The cumulative probability of tokens to consider for sampling.'
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
			path: '/v1/chat/completions',
			method: 'POST'
		}
	},
	parameters: {
		chat: chatParameters
	}
};

const langchainCapability: LangChainCapability = {
	capability: 'langchain',
	roles: ['llm', 'tool']
};

export const openaiDefinition: ServiceDefinition = {
	type: 'openai',
	name: 'OpenAI',
	category: SERVICE_CATEGORIES.LLM,
	defaultPort: 443,
	docs: {
		api: 'https://platform.openai.com/docs/api-reference'
	},
	authentication: {
		type: 'bearer_token',
		help: 'You can find your OpenAI API key on your API keys page.'
	},
	capabilities: [llmChatCapability, langchainCapability],
	configuration: {
		help: {
			instructions: 'Simply add your API key to connect to the OpenAI API.'
		}
	}
}; 
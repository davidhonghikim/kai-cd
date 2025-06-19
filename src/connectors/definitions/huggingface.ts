import type {
	ServiceDefinition,
	LlmChatCapability,
	ImageGenerationCapability,
	ParameterDefinition
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const llmChatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: 'mistralai/Mistral-7B-Instruct-v0.2',
		description: 'The ID of the model to use for chat.',
		optionsEndpoint: 'getModels',
		optionsPath: '', // The root is the array
		optionsValueKey: 'id',
		optionsLabelKey: 'id'
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 0.7,
		range: [0, 2],
		step: 0.1,
		description: 'Controls randomness.'
	},
	{
		key: 'top_p',
		label: 'Top P',
		type: 'number',
		defaultValue: 0.95,
		range: [0, 1],
		step: 0.05,
		description: 'The cumulative probability of tokens to consider for sampling.'
	},
	{
		key: 'max_new_tokens',
		label: 'Max New Tokens',
		type: 'number',
		defaultValue: 256,
		range: [1, 4096],
		step: 8,
		description: 'The maximum number of tokens to generate.'
	}
];

const imageGenerationParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model',
		type: 'select',
		defaultValue: 'stabilityai/stable-diffusion-xl-base-1.0',
		description: 'The ID of the model to use for image generation.',
		optionsEndpoint: 'getModels',
		optionsPath: '', // The root is the array
		optionsValueKey: 'id',
		optionsLabelKey: 'id'
	},
	{
		key: 'prompt',
		label: 'Prompt',
		type: 'string',
		defaultValue: 'A photo of an astronaut riding a horse on Mars.',
		description: 'The main text prompt describing the desired image.'
	},
	{
		key: 'negative_prompt',
		label: 'Negative Prompt',
		type: 'string',
		defaultValue: '',
		description: 'The negative prompt, describing what to avoid in the image.'
	}
];

const llmChatCapability: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		// Note: The host for these will be different (huggingface.co vs api-inference.huggingface.co)
		// This will need to be handled by the service connection logic.
		getModels: {
			path: '/api/models?pipeline_tag=text-generation&sort=likes&direction=-1&limit=100',
			method: 'GET'
		},
		chat: { path: '/v1/chat/completions', method: 'POST' } // This is an OpenAI compatible endpoint
	},
	parameters: {
		chat: llmChatParameters
	}
};

const imageGenerationCapability: ImageGenerationCapability = {
	capability: 'image_generation',
	endpoints: {
		getModels: {
			path: '/api/models?pipeline_tag=text-to-image&sort=likes&direction=-1&limit=100',
			method: 'GET'
		},
		// The model ID will be part of the path, so we use a placeholder
		generate: { path: '/models/{model}', method: 'POST' }
	},
	parameters: {
		img2img: [], // Not yet implemented
		txt2img: imageGenerationParameters
	}
};

export const huggingfaceDefinition: ServiceDefinition = {
	type: 'huggingface',
	name: 'Hugging Face',
	category: SERVICE_CATEGORIES.LLM,
	defaultPort: 443,
	docs: {
		api: 'https://huggingface.co/docs/api-inference/index'
	},
	authentication: {
		type: 'bearer_token',
		help: 'You can get your Hugging Face API token from your settings page.'
	},
	capabilities: [llmChatCapability, imageGenerationCapability],
	configuration: {
		help: {
			instructions: 'Simply add your API token to connect to the Hugging Face Inference API.'
		}
	}
}; 
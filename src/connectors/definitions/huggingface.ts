import type {
	ServiceDefinition,
	LlmChatCapability,
	ImageGenerationCapability,
	ParameterDefinition,
	ModelManagementCapability
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

// Note: Hugging Face uses different domains for its Hub API and Inference API.
// - huggingface.co for model listing and management
// - api-inference.huggingface.co for running inference
// The client implementation will need to handle this.
// For the Inference API, the model ID is part of the URL path, not the request body.

const llmChatParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model ID',
		type: 'string',
		defaultValue: 'mistralai/Mistral-7B-Instruct-v0.2',
		description: 'The ID of the model to use for inference (e.g., mistralai/Mistral-7B-v0.1). This will be part of the URL.',
	},
	{
		key: 'temperature',
		label: 'Temperature',
		type: 'number',
		defaultValue: 0.7,
		range: [0.1, 2.0],
		step: 0.1,
		description: 'Controls randomness. Lowering results in less random completions.',
	},
	{
		key: 'top_k',
		label: 'Top-K',
		type: 'number',
		defaultValue: null,
		description: 'The number of highest probability vocabulary tokens to keep for top-k-filtering.',
	},
	{
		key: 'top_p',
		label: 'Top-P',
		type: 'number',
		defaultValue: null,
		description: 'If set to < 1, only the smallest set of most probable tokens with probabilities that add up to top_p or higher are kept for generation.',
	},
	{
		key: 'max_new_tokens',
		label: 'Max New Tokens',
		type: 'number',
		defaultValue: 256,
		description: 'The maximum number of tokens to generate.',
	},
	{
		key: 'repetition_penalty',
		label: 'Repetition Penalty',
		type: 'number',
		defaultValue: null,
		description: 'The parameter for repetition penalty. 1.0 means no penalty.',
	},
];

const imageGenerationParameters: ParameterDefinition[] = [
	{
		key: 'model',
		label: 'Model ID',
		type: 'string',
		defaultValue: 'stabilityai/stable-diffusion-2-1',
		description: 'The ID of the model to use for image generation.',
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
	},
	{
		key: 'height',
		label: 'Height',
		type: 'number',
		defaultValue: 768,
		description: 'The height in pixels of the output image.',
	},
	{
		key: 'width',
		label: 'Width',
		type: 'number',
		defaultValue: 768,
		description: 'The width in pixels of the output image.',
	},
	{
		key: 'num_inference_steps',
		label: 'Inference Steps',
		type: 'number',
		defaultValue: 25,
		description: 'The number of denoising steps.',
	}
];

const modelManagementParameters: ParameterDefinition[] = [
	{
		key: 'search',
		label: 'Search',
		type: 'string',
		defaultValue: '',
		description: 'A string to search for in model names and descriptions.',
	},
	{
		key: 'author',
		label: 'Author',
		type: 'string',
		defaultValue: '',
		description: 'Filter by a specific user or organization.',
	},
	{
		key: 'filter',
		label: 'Task Filter',
		type: 'string',
		defaultValue: 'text-generation',
		description: 'Filter by a specific task, e.g., text-generation, text-classification.',
	},
];

const llmChatCapability: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		// The model ID must be appended to this path by the client.
		chat: { path: 'https://api-inference.huggingface.co/models/', method: 'POST' },
	},
	parameters: {
		chat: llmChatParameters
	}
};

const imageGenerationCapability: ImageGenerationCapability = {
	capability: 'image_generation',
	endpoints: {
		// The model ID must be appended to this path by the client.
		generate: { path: 'https://api-inference.huggingface.co/models/', method: 'POST' }
	},
	parameters: {
		txt2img: imageGenerationParameters
	}
};

const modelManagementCapability: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		list: { path: 'https://huggingface.co/api/models', method: 'GET' },
	},
	parameters: {
		list: modelManagementParameters,
	}
};

const HuggingFaceDefinition: ServiceDefinition = {
	type: 'huggingface',
	name: 'Hugging Face',
	category: SERVICE_CATEGORIES.MODEL_MANAGEMENT,
	docs: {
		hub: 'https://huggingface.co/docs/huggingface_hub/v0.8.0/en/package_reference/hf_api',
		inference: 'https://huggingface.co/docs/api-inference/en/tasks/text-generation',
	},
	authentication: {
		type: 'bearer_token',
		help: 'Generate a User Access Token from your Hugging Face account settings.',
	},
	capabilities: [llmChatCapability, imageGenerationCapability, modelManagementCapability],
	defaultPort: 443,
};

export default HuggingFaceDefinition; 
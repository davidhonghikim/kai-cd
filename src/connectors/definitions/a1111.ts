import type { ServiceDefinition, ImageGenerationCapability, ParameterDefinition, HealthCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

const txt2imgParameters: ParameterDefinition[] = [
	{
		key: 'prompt',
		label: 'Prompt',
		type: 'string',
		defaultValue: '',
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
		key: 'sampler_name',
		label: 'Sampling Method',
		type: 'select',
		defaultValue: 'Euler a',
		description: 'The algorithm to use for the denoising process.',
		optionsEndpoint: 'getSamplers',
		optionsPath: '', // The response is an array of objects
		optionsValueKey: 'name',
		optionsLabelKey: 'name'
	},
	{
		key: 'steps',
		label: 'Sampling Steps',
		type: 'number',
		defaultValue: 20,
		range: [1, 150],
		description: 'How many steps to spend generating the image.'
	},
	{
		key: 'cfg_scale',
		label: 'CFG Scale',
		type: 'number',
		defaultValue: 7,
		range: [1, 30],
		description: 'How strongly the image should conform to the prompt. Lower values are more creative.'
	},
	{
		key: 'width',
		label: 'Width',
		type: 'number',
		defaultValue: 512,
		range: [64, 2048],
		step: 64,
		description: 'Width of the output image in pixels.'
	},
	{
		key: 'height',
		label: 'Height',
		type: 'number',
		defaultValue: 512,
		range: [64, 2048],
		step: 64,
		description: 'Height of the output image in pixels.'
	},
	{
		key: 'seed',
		label: 'Seed',
		type: 'number',
		defaultValue: -1,
		description:
			'The seed for the random number generator. -1 means random. Same seed and settings produce the same image.'
	},
	{
		key: 'sd_model_checkpoint',
		label: 'Checkpoint Model',
		type: 'select',
		description: 'Use a specific checkpoint model for this generation.',
		defaultValue: config.services.defaultA1111Model,
		optionsEndpoint: 'getModels',
		optionsPath: '', // The response is an array of objects
		optionsValueKey: 'model_name',
		optionsLabelKey: 'title'
	},
	{
		key: 'refiner_checkpoint',
		label: 'Refiner Checkpoint (SD-XL)',
		type: 'select',
		description: 'The SD-XL refiner model to use for the second pass.',
		defaultValue: config.services.defaultA1111Refiner,
		optionsEndpoint: 'getModels',
		optionsPath: '',
		optionsValueKey: 'model_name',
		optionsLabelKey: 'title'
	},
	{
		key: 'refiner_switch_at',
		label: 'Refiner Switch At (SD-XL)',
		type: 'number',
		defaultValue: 0.8,
		range: [0, 1],
		step: 0.05,
		description: 'The point in the sampling process to switch to the refiner model (e.g., 0.8 for the last 20% of steps).'
	},
	{
		key: 'enable_hr',
		label: 'Enable High-Res Fix',
		type: 'boolean',
		defaultValue: false,
		description: 'Enable the high-resolution fix pass.'
	},
	{
		key: 'denoising_strength',
		label: 'Denoising Strength (High-Res)',
		type: 'number',
		defaultValue: 0.7,
		range: [0, 1],
		description: 'How much noise to add to the upscaled image for the high-res pass. 0.5-0.75 is a good range.'
	},
	{
		key: 'hr_scale',
		label: 'Upscale By',
		type: 'number',
		defaultValue: 2,
		range: [1, 4],
		description: 'The factor by which to upscale the image.'
	},
	{
		key: 'hr_upscaler',
		label: 'Upscaler',
		type: 'select',
		defaultValue: 'Latent',
		description: 'The upscaler to use for the high-res pass.',
		optionsEndpoint: 'getUpscalers',
		optionsPath: '',
		optionsValueKey: 'name',
		optionsLabelKey: 'name'
	},
	{
		key: 'hr_second_pass_steps',
		label: 'Hires Steps',
		type: 'number',
		defaultValue: 0,
		range: [0, 150],
		description: 'Number of sampling steps for the high-res pass. 0 uses original steps.'
	}
];

const img2imgParameters: ParameterDefinition[] = [
	{
		key: 'init_image',
		label: 'Initial Image',
		type: 'file',
		defaultValue: null,
		description: 'The image to start the generation from.'
	},
	{
		key: 'denoising_strength',
		label: 'Denoising Strength',
		type: 'number',
		defaultValue: 0.75,
		range: [0, 1],
		description:
			'How much to alter the original image. 0 means no change, 1 means a completely new image.'
	},
	...txt2imgParameters.filter(p => !['enable_hr', 'hr_scale', 'hr_upscaler', 'hr_second_pass_steps'].includes(p.key) && p.label !== 'Denoising Strength (High-Res)')
];

const imageGenerationCapability: ImageGenerationCapability = {
	capability: 'image_generation',
	endpoints: {
		txt2img: { path: '/sdapi/v1/txt2img', method: 'POST' },
		img2img: { path: '/sdapi/v1/img2img', method: 'POST' },
		getModels: { path: '/sdapi/v1/sd-models', method: 'GET' },
		getLoras: { path: '/sdapi/v1/loras', method: 'GET' },
		getHypernetworks: { path: '/sdapi/v1/hypernetworks', method: 'GET' },
		getSamplers: { path: '/sdapi/v1/samplers', method: 'GET' },
		getUpscalers: { path: '/sdapi/v1/upscalers', method: 'GET' }
	},
	parameters: {
		txt2img: txt2imgParameters,
		img2img: img2imgParameters
	}
};

const healthCapability: HealthCapability = {
	capability: 'health',
	endpoints: {
		health: { path: '/sdapi/v1/memory', method: 'GET' }
	}
};

export const a1111Definition: ServiceDefinition = {
	type: 'a1111',
	name: 'A1111 WebUI',
	category: SERVICE_CATEGORIES.IMAGE_GENERATION,
	defaultPort: 7860,
	hasExternalUi: true,
	docs: {
		api: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API'
	},
	configuration: {
		arguments: {
			enableApi: {
				flag: '--api',
				description: 'Enables the API endpoint.',
				required: true
			},
			enableCors: {
				flag: "--cors-allow-origins='*'",
				description: 'Enables Cross-Origin Resource Sharing for the API.',
				required: true
			}
		},
		help: {
			instructions:
				"To use A1111 with Kai-cd, you must launch the web UI with the `--api` and `--cors-allow-origins='*'` arguments."
		}
	},
	authentication: {
		type: 'none'
	},
	capabilities: [imageGenerationCapability, healthCapability]
}; 
import type { ServiceDefinition, ImageGenerationCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

// Based on the standard txt2img workflow for ComfyUI.
// These parameters will be used to modify the workflow JSON before submission.
const txt2imgParameters: ParameterDefinition[] = [
	{
		key: 'positive_prompt',
		label: 'Positive Prompt',
		type: 'string',
		defaultValue: 'A beautiful landscape painting.',
		description: 'The positive text prompt. Corresponds to the `text` input of the positive CLIPTextEncode node.'
	},
	{
		key: 'negative_prompt',
		label: 'Negative Prompt',
		type: 'string',
		defaultValue: 'ugly, deformed, bad anatomy',
		description: 'The negative text prompt. Corresponds to the `text` input of the negative CLIPTextEncode node.'
	},
	{
		key: 'ckpt_name',
		label: 'Checkpoint Model',
		type: 'select',
		defaultValue: '',
		description: 'The checkpoint model to use. Corresponds to the `ckpt_name` input of the CheckpointLoaderSimple node.',
		optionsEndpoint: 'getCheckpoints',
		optionsPath: 'input.required.ckpt_name.0',
		optionsValueKey: '', // The value is the string itself
		optionsLabelKey: '' // The label is the string itself
	},
	{
		key: 'lora_name',
		label: 'LoRA Model',
		type: 'select',
		defaultValue: 'None',
		description: 'The LoRA model to use. Corresponds to the `lora_name` input of the LoraLoader node.',
		optionsEndpoint: 'getLoras',
		optionsPath: 'input.required.lora_name.0',
		optionsValueKey: '', // The value is the string itself
		optionsLabelKey: '' // The label is the string itself
	},
	{
		key: 'seed',
		label: 'Seed',
		type: 'number',
		defaultValue: 0,
		description: 'The seed for the random number generator. Corresponds to the `seed` input of the KSampler node.'
	},
	{
		key: 'steps',
		label: 'Steps',
		type: 'number',
		defaultValue: 20,
		range: [1, 100],
		description: 'Number of sampling steps. Corresponds to the `steps` input of the KSampler node.'
	},
	{
		key: 'cfg',
		label: 'CFG Scale',
		type: 'number',
		defaultValue: 8.0,
		range: [1, 20],
		description: 'How strongly the image should conform to the prompt. Corresponds to the `cfg` input of the KSampler node.'
	},
	{
		key: 'sampler_name',
		label: 'Sampler',
		type: 'select',
		defaultValue: 'euler',
		description: 'The sampling algorithm. Corresponds to the `sampler_name` input of the KSampler node.',
		optionsEndpoint: 'getSamplers',
		optionsPath: 'input.required.sampler_name.0',
		optionsValueKey: '',
		optionsLabelKey: ''
	},
	{
		key: 'scheduler',
		label: 'Scheduler',
		type: 'select',
		defaultValue: 'normal',
		description: 'The noise scheduler. Corresponds to the `scheduler` input of the KSampler node.',
		optionsEndpoint: 'getSchedulers',
		optionsPath: 'input.required.scheduler.0',
		optionsValueKey: '',
		optionsLabelKey: ''
	},
	{
		key: 'width',
		label: 'Width',
		type: 'number',
		defaultValue: 512,
		range: [64, 2048],
		step: 64,
		description: 'Width of the latent image. Corresponds to the `width` input of the EmptyLatentImage node.'
	},
	{
		key: 'height',
		label: 'Height',
		type: 'number',
		defaultValue: 512,
		range: [64, 2048],
		step: 64,
		description: 'Height of the latent image. Corresponds to the `height` input of the EmptyLatentImage node.'
	}
];

const img2imgParameters: ParameterDefinition[] = [
	{
		key: 'init_image',
		label: 'Initial Image',
		type: 'file',
		defaultValue: null,
		description: 'The image to start the generation from. This will be loaded into a LoadImage node.'
	},
	{
		key: 'denoising_strength',
		label: 'Denoising Strength',
		type: 'number',
		defaultValue: 0.8,
		range: [0, 1],
		step: 0.05,
		description: 'How much to alter the original image. Corresponds to the `denoise` input of the KSampler node.'
	},
	...txt2imgParameters.filter(p => !['width', 'height'].includes(p.key))
];

const imageGenerationCapability: ImageGenerationCapability = {
	capability: 'image_generation',
	endpoints: {
		// The 'prompt' endpoint is used to queue a workflow
		txt2img: { path: '/prompt', method: 'POST' },
		// img2img is also handled by submitting a workflow to /prompt
		img2img: { path: '/prompt', method: 'POST' },
		getCheckpoints: { path: '/object_info/CheckpointLoaderSimple', method: 'GET' },
		getLoras: { path: '/object_info/LoraLoader', method: 'GET' },
		getSamplers: { path: '/object_info/KSampler', method: 'GET' },
		getSchedulers: { path: '/object_info/KSampler', method: 'GET' }
	},
	parameters: {
		txt2img: txt2imgParameters,
		img2img: img2imgParameters
	}
};

export const comfyUIDefinition: ServiceDefinition = {
	type: 'comfy-ui',
	name: 'ComfyUI',
	category: SERVICE_CATEGORIES.IMAGE_GENERATION,
	defaultPort: 8188,
	docs: {
		api: 'https://docs.comfy.org/manual/API.html'
	},
	configuration: {
		arguments: {
			enableCors: {
				flag: '--enable-cors-header',
				description: 'Enables web-based access to the API.',
				required: true
			}
		},
		help: {
			instructions:
				'To use ComfyUI with Kai-cd, you must launch it with the --enable-cors-header argument.'
		}
	},
	authentication: {
		type: 'none'
	},
	capabilities: [imageGenerationCapability]
}; 
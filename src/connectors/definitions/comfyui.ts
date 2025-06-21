import type {
	ServiceDefinition,
	LlmChatCapability,
	ModelManagementCapability,
	GraphExecutionCapability,
	ImageGenerationCapability,
	ComfyWorkflow,
	HealthCapability
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

// NOTE: ComfyUI's API is very different. It's a graph-based system.
// We will need a more complex capability definition to handle this.
// For now, let's create a placeholder.

const _LlmChat: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {
		chat: { path: '/prompt', method: 'POST' }
	},
	parameters: {
		chat: []
	}
};

// A default, standard text-to-image workflow for ComfyUI.
// This graph is what will be sent to the /prompt endpoint.
const baseWorkflow: ComfyWorkflow = {
	"3": {
		"inputs": {
			"seed": 0, // Placeholder, will be replaced by parameterMapping
			"steps": 20,
			"cfg": 8,
			"sampler_name": "euler",
			"scheduler": "normal",
			"denoise": 1,
			"model": ["4", 0],
			"positive": ["6", 0],
			"negative": ["7", 0],
			"latent_image": ["5", 0]
		},
		"class_type": "KSampler",
	},
	"4": {
		"inputs": { "ckpt_name": "v1-5-pruned-emaonly.safetensors" },
		"class_type": "CheckpointLoaderSimple",
	},
	"5": {
		"inputs": {
			"width": 512,
			"height": 512,
			"batch_size": 1
		},
		"class_type": "EmptyLatentImage",
	},
	"6": {
		"inputs": {
			"text": "a beautiful landscape",
			"clip": ["4", 1]
		},
		"class_type": "CLIPTextEncode",
	},
	"7": {
		"inputs": {
			"text": "ugly, deformed",
			"clip": ["4", 1]
		},
		"class_type": "CLIPTextEncode",
	},
	"8": {
		"inputs": {
			"filename_prefix": "kai-cd/ComfyUI",
			"images": ["9", 0]
		},
		"class_type": "SaveImage",
	},
	"9": {
		"inputs": {
			"samples": ["3", 0],
			"vae": ["4", 2]
		},
		"class_type": "VAEDecode",
	}
};

const graphExecution: GraphExecutionCapability = {
	capability: 'graph_execution',
	baseWorkflow: baseWorkflow,
	endpoints: {
		prompt: { path: '/prompt', method: 'POST' },
		view: { path: '/view', method: 'GET' },
		history: { path: '/history', method: 'GET' },
		websocket: { path: '/ws', method: 'GET' }
	},
	parameterMapping: {
		prompt: {
			nodeId: "6", inputKey: "text",
			parameterDefinition: { key: 'prompt', label: 'Prompt', type: 'string', defaultValue: 'a beautiful landscape', description: 'The main positive prompt.' }
		},
		negative_prompt: {
			nodeId: "7", inputKey: "text",
			parameterDefinition: { key: 'negative_prompt', label: 'Negative Prompt', type: 'string', defaultValue: 'ugly, deformed', description: 'The negative prompt.' }
		},
		sd_model_checkpoint: {
			nodeId: "4", inputKey: "ckpt_name",
			parameterDefinition: { key: 'sd_model_checkpoint', label: 'Checkpoint Model', type: 'select', defaultValue: config.services.defaultComfyUIModel, optionsEndpoint: 'getModels', description: 'The main Stable Diffusion checkpoint model.' }
		},
		seed: {
			nodeId: "3", inputKey: "seed",
			parameterDefinition: { key: 'seed', label: 'Seed', type: 'number', defaultValue: 0, description: 'The random seed. 0 for random.' }
		},
		steps: {
			nodeId: "3", inputKey: "steps",
			parameterDefinition: { key: 'steps', label: 'Steps', type: 'number', defaultValue: 20, range: [1, 100], description: 'Number of sampling steps.' }
		},
		cfg_scale: {
			nodeId: "3", inputKey: "cfg",
			parameterDefinition: { key: 'cfg_scale', label: 'CFG Scale', type: 'number', defaultValue: 8, range: [1, 30], description: 'How strictly to follow the prompt.' }
		},
		sampler_name: {
			nodeId: "3", inputKey: "sampler_name",
			parameterDefinition: { key: 'sampler_name', label: 'Sampler', type: 'select', defaultValue: 'euler', optionsEndpoint: 'getSamplers', description: 'The sampling algorithm.' }
		},
		scheduler: {
			nodeId: "3", inputKey: "scheduler",
			parameterDefinition: { key: 'scheduler', label: 'Scheduler', type: 'select', defaultValue: 'normal', options: ['normal', 'karras', 'exponential', 'sgm_uniform', 'simple', 'ddim_uniform'], description: 'The scheduler for the sampler.' }
		},
		denoise: {
			nodeId: "3", inputKey: "denoise",
			parameterDefinition: { key: 'denoise', label: 'Denoise', type: 'number', defaultValue: 1, range: [0, 1], description: 'The denoising strength.' }
		},
		width: {
			nodeId: "5", inputKey: "width",
			parameterDefinition: { key: 'width', label: 'Width', type: 'number', defaultValue: 512, range: [64, 2048], step: 64, description: 'Image width.' }
		},
		height: {
			nodeId: "5", inputKey: "height",
			parameterDefinition: { key: 'height', label: 'Height', type: 'number', defaultValue: 512, range: [64, 2048], step: 64, description: 'Image height.' }
		},
	}
};

const imageGeneration: ImageGenerationCapability = {
	capability: 'image_generation',
	endpoints: {
		txt2img: { path: '/prompt', method: 'POST' }
	},
	parameters: {
		txt2img: Object.values(graphExecution.parameterMapping).map(p => p.parameterDefinition)
	}
}

const healthCapability: HealthCapability = {
	capability: 'health',
	endpoints: {
		health: { path: '/system_stats', method: 'GET' }
	}
};
const models: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		getModels: { path: '/object_info/CheckpointLoaderSimple', method: 'GET' },
		getSamplers: { path: '/object_info/KSampler', method: 'GET' },
		getVAEs: { path: '/object_info/VAELoader', method: 'GET' },
	},
	parameters: {},
	responseMapping: {
		getModels: { path: 'input.required.ckpt_name.0', valueKey: '', labelKey: '' },
		getSamplers: { path: 'input.required.sampler_name.0', valueKey: '', labelKey: '' },
		getVAEs: { path: 'input.required.vae_name.0', valueKey: '', labelKey: '' },
	}
};


export const comfyuiDefinition: ServiceDefinition = {
	type: 'comfyui',
	name: 'ComfyUI',
	category: SERVICE_CATEGORIES.IMAGE_GENERATION,
	defaultPort: 8188,
	hasExternalUi: true,
	docs: {
		api: 'https://github.com/comfyanonymous/ComfyUI_API_Examples'
	},
	configuration: {
		arguments: {},
		help: {
			instructions: 'No special launch arguments are needed to use the ComfyUI API with Kai-cd.'
		}
	},
	authentication: {
		type: 'none'
	},
	capabilities: [models, graphExecution, imageGeneration, healthCapability]
}; 
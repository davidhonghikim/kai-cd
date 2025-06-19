import type {
	ServiceDefinition,
	LlmChatCapability,
	ModelManagementCapability,
	GraphExecutionCapability,
	ComfyWorkflow
} from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

// NOTE: ComfyUI's API is very different. It's a graph-based system.
// We will need a more complex capability definition to handle this.
// For now, let's create a placeholder.

const LlmChat: LlmChatCapability = {
	capability: 'llm_chat',
	endpoints: {},
	parameters: {
		chat: []
	}
};

const models: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {},
	parameters: {}
};

const graphExecution: GraphExecutionCapability = {
	capability: 'graph_execution',
	baseWorkflow: {} as ComfyWorkflow, // Placeholder
	endpoints: {
		prompt: { path: '/prompt', method: 'POST' },
		view: { path: '/view', method: 'GET' },
		history: { path: '/history', method: 'GET' },
		websocket: { path: '/ws', method: 'GET' }
	},
	parameterMapping: {}
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
		arguments: {
			// ComfyUI doesn't require special arguments to enable the API by default.
		},
		help: {
			instructions: 'No special launch arguments are needed to use the ComfyUI API with Kai-cd.'
		}
	},
	authentication: {
		type: 'none'
	},
	capabilities: [LlmChat, models, graphExecution]
}; 
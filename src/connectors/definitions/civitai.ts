import type { ServiceDefinition, ModelManagementCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const modelManagementParameters: ParameterDefinition[] = [
	{
		key: 'query',
		label: 'Query',
		type: 'string',
		defaultValue: '',
		description: 'Search query to filter models by name.'
	},
	{
		key: 'tag',
		label: 'Tag',
		type: 'string',
		defaultValue: '',
		description: 'Search query to filter models by tag.'
	},
	{
		key: 'username',
		label: 'Username',
		type: 'string',
		defaultValue: '',
		description: 'Search query to filter models by user.'
	},
	{
		key: 'types',
		label: 'Model Types',
		type: 'select',
		multiple: true,
		defaultValue: [],
		description: 'The type of model you want to filter with.',
		options: [
			{ value: 'Checkpoint', label: 'Checkpoint' },
			{ value: 'TextualInversion', label: 'Textual Inversion' },
			{ value: 'Hypernetwork', label: 'Hypernetwork' },
			{ value: 'AestheticGradient', label: 'Aesthetic Gradient' },
			{ value: 'LORA', label: 'LORA' },
			{ value: 'Controlnet', label: 'Controlnet' },
			{ value: 'Poses', label: 'Poses' }
		]
	},
	{
		key: 'sort',
		label: 'Sort By',
		type: 'select',
		defaultValue: 'Highest Rated',
		description: 'The order in which you wish to sort the results.',
		options: [
			{ value: 'Highest Rated', label: 'Highest Rated' },
			{ value: 'Most Downloaded', label: 'Most Downloaded' },
			{ value: 'Newest', label: 'Newest' }
		]
	},
	{
		key: 'period',
		label: 'Period',
		type: 'select',
		defaultValue: 'AllTime',
		description: 'The time frame in which the models will be sorted.',
		options: [
			{ value: 'AllTime', label: 'All Time' },
			{ value: 'Year', label: 'Year' },
			{ value: 'Month', label: 'Month' },
			{ value: 'Week', label: 'Week' },
			{ value: 'Day', label: 'Day' }
		]
	}
];

const modelManagementCapability: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		list: { path: '/api/v1/models', method: 'GET' }
	},
	parameters: {
		list: modelManagementParameters
	}
};

const civitaiDefinition: ServiceDefinition = {
	type: 'civitai',
	name: 'Civitai',
	category: SERVICE_CATEGORIES.MODEL_MANAGEMENT,
	docs: {
		api: 'https://github.com/civitai/civitai/wiki/REST-API-Reference'
	},
	authentication: {
		type: 'bearer_token',
		help: 'Generate an API Key from your User Account Settings.'
	},
	capabilities: [modelManagementCapability],
	defaultPort: 0
};

export { civitaiDefinition }; 
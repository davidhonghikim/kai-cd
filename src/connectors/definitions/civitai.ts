import type { ServiceDefinition, ModelManagementCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const searchParameters: ParameterDefinition[] = [
	{
		key: 'query',
		label: 'Search',
		type: 'string',
		defaultValue: '',
		description: 'Search for models by name.'
	},
	{
		key: 'types',
		label: 'Model Types',
		type: 'select',
		defaultValue: 'Checkpoint',
		description: 'Filter by model type.',
		options: ['Checkpoint', 'TextualInversion', 'Hypernetwork', 'AestheticGradient', 'LORA', 'Controlnet', 'Poses']
	},
	{
		key: 'sort',
		label: 'Sort By',
		type: 'select',
		defaultValue: 'Most Downloaded',
		description: 'Sort the results.',
		options: ['Highest Rated', 'Most Downloaded', 'Newest']
	},
	{
		key: 'period',
		label: 'Period',
		type: 'select',
		defaultValue: 'AllTime',
		description: 'The time period to sort by.',
		options: ['AllTime', 'Year', 'Month', 'Week', 'Day']
	}
];

const modelManagementCapability: ModelManagementCapability = {
	capability: 'model_management',
	endpoints: {
		getModels: {
			path: '/api/v1/models',
			method: 'GET'
		}
	},
	parameters: {
		search: searchParameters
	}
};

export const civitaiDefinition: ServiceDefinition = {
	type: 'civitai',
	name: 'Civitai',
	category: SERVICE_CATEGORIES.MODEL_MANAGEMENT,
	defaultPort: 443,
	docs: {
		api: 'https://github.com/civitai/civitai/wiki/REST-API-Reference'
	},
	authentication: {
		type: 'api_key',
		keyName: 'Authorization',
		keyLocation: 'header',
		help: 'You can get your Civitai API Key from your User Account Settings.'
	},
	capabilities: [modelManagementCapability],
	configuration: {
		help: {
			instructions:
				'Provide your Civitai API Key to browse and download models. An API key is not required for public models, but is recommended.'
		}
	}
}; 
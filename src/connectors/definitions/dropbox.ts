import type { ServiceDefinition, StorageCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const listFilesParameters: ParameterDefinition[] = [
	{
		key: 'path',
		label: 'Path',
		type: 'string',
		defaultValue: '',
		description: 'The path to the folder to list. Leave empty for the root folder.'
	},
	{
		key: 'recursive',
		label: 'Recursive',
		type: 'boolean',
		defaultValue: false,
		description: 'If true, the list folder operation will be applied recursively to all subfolders.'
	}
];

const storageCapability: StorageCapability = {
	capability: 'storage',
	endpoints: {
		listFiles: {
			path: '/2/files/list_folder',
			method: 'POST'
		}
	},
	parameters: {
		list: listFilesParameters
	}
};

export const dropboxDefinition: ServiceDefinition = {
	type: 'dropbox',
	name: 'Dropbox',
	category: SERVICE_CATEGORIES.STORAGE,
	defaultPort: 443,
	docs: {
		api: 'https://www.dropbox.com/developers/documentation/http/documentation'
	},
	authentication: {
		type: 'bearer_token',
		help: 'Generate a temporary access token from the App Console in your Dropbox developer account.'
	},
	capabilities: [storageCapability],
	configuration: {
		help: {
			instructions: 'Simply add your generated access token to connect to the Dropbox API.'
		}
	}
}; 
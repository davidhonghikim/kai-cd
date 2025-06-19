import type { ServiceDefinition, AutomationCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const executeParameters: ParameterDefinition[] = [
	{
		key: 'workflowId',
		label: 'Workflow',
		type: 'select',
		defaultValue: '',
		description: 'The workflow to execute.',
		optionsEndpoint: 'listWorkflows',
		optionsPath: 'data',
		optionsValueKey: 'id',
		optionsLabelKey: 'name'
	}
];

const automationCapability: AutomationCapability = {
	capability: 'automation',
	endpoints: {
		listWorkflows: {
			path: '/api/v1/workflows',
			method: 'GET'
		},
		executeWorkflow: {
			path: '/api/v1/workflows/{workflowId}/executions',
			method: 'POST'
		}
	},
	parameters: {
		execute: executeParameters
	}
};

export const n8nDefinition: ServiceDefinition = {
	type: 'n8n',
	name: 'n8n',
	category: SERVICE_CATEGORIES.AUTOMATION,
	defaultPort: 5678,
	docs: {
		api: 'https://docs.n8n.io/api-reference/introduction/'
	},
	authentication: {
		type: 'api_key',
		keyName: 'X-N8N-API-KEY',
		help: 'You can find your n8n API key in your instance under Settings > API.'
	},
	capabilities: [automationCapability],
	configuration: {
		help: {
			instructions: 'Provide the URL and API key for your n8n instance.'
		}
	}
}; 
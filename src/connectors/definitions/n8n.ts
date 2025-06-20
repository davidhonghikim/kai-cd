import type { ServiceDefinition, AutomationCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const workflowIdParameter: ParameterDefinition = {
	key: 'id',
	label: 'Workflow ID',
	type: 'string',
	defaultValue: '',
	description: 'The ID of the workflow.'
};

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
		getWorkflow: {
			path: '/api/v1/workflows/{id}',
			method: 'GET'
		},
		createWorkflow: {
			path: '/api/v1/workflows',
			method: 'POST'
		},
		updateWorkflow: {
			path: '/api/v1/workflows/{id}',
			method: 'PUT'
		},
		deleteWorkflow: {
			path: '/api/v1/workflows/{id}',
			method: 'DELETE'
		},
		activateWorkflow: {
			path: '/api/v1/workflows/{id}/activate',
			method: 'POST'
		},
		deactivateWorkflow: {
			path: '/api/v1/workflows/{id}/deactivate',
			method: 'POST'
		},
		executeWorkflow: {
			path: '/api/v1/workflows/{workflowId}/executions',
			method: 'POST'
		}
	},
	parameters: {
		execute: executeParameters,
		getWorkflow: [workflowIdParameter],
		deleteWorkflow: [workflowIdParameter],
		activateWorkflow: [workflowIdParameter],
		deactivateWorkflow: [workflowIdParameter]
		// NOTE: createWorkflow and updateWorkflow require a complex JSON body,
		// which we will define more thoroughly when building the UI for them.
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
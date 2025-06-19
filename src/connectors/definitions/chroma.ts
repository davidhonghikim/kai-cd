import type { ServiceDefinition, VectorDatabaseCapability, ParameterDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const queryParameters: ParameterDefinition[] = [
	{
		key: 'query_texts',
		label: 'Query Texts',
		type: 'string',
		defaultValue: '',
		description: 'The text(s) to query for.'
	},
	{
		key: 'n_results',
		label: 'Number of Results',
		type: 'number',
		defaultValue: 10,
		description: 'The number of results to return.'
	}
];

const vectorDatabaseCapability: VectorDatabaseCapability = {
	capability: 'vector_database',
	endpoints: {
		listCollections: {
			path: '/api/v1/collections',
			method: 'GET'
		},
		createCollection: {
			path: '/api/v1/collections',
			method: 'POST'
		},
		upsert: {
			path: '/api/v1/collections/{collection_id}/add',
			method: 'POST'
		},
		query: {
			path: '/api/v1/collections/{collection_id}/query',
			method: 'POST'
		}
	},
	parameters: {
		query: queryParameters
	}
};

export const chromaDefinition: ServiceDefinition = {
	type: 'chroma',
	name: 'ChromaDB',
	category: SERVICE_CATEGORIES.VECTOR_DATABASE,
	defaultPort: 8000,
	docs: {
		api: 'https://docs.trychroma.com/reference'
	},
	authentication: {
		type: 'none'
	},
	capabilities: [vectorDatabaseCapability],
	configuration: {
		help: {
			instructions: 'ChromaDB should work out-of-the-box if it is running on the specified host and port.'
		}
	}
}; 
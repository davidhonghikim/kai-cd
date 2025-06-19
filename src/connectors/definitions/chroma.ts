import type { ServiceDefinition, VectorDatabaseCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const vectorDatabaseCapability: VectorDatabaseCapability = {
	capability: 'vector_database',
	endpoints: {
		listCollections: { path: '/api/v1/collections', method: 'GET' },
		query: { path: '/api/v1/collections/{collection_id}/query', method: 'POST' },
		upsert: { path: '/api/v1/collections/{collection_id}/add', method: 'POST' },
		delete: { path: '/api/v1/collections/{collection_id}/delete', method: 'POST' }
	},
	parameters: {
		query: [
			{
				key: 'query_texts',
				label: 'Query Texts',
				type: 'string',
				defaultValue: [],
				description: 'The text(s) to search for.'
			},
			{
				key: 'n_results',
				label: 'Number of Results',
				type: 'number',
				defaultValue: 10,
				description: 'The number of results to return.'
			},
			{
				key: 'where',
				label: 'Where Filter',
				type: 'string',
				defaultValue: '{}',
				description: 'A filter to apply to the search (e.g., {"source": "my_source"}).'
			}
		],
		upsert: [
			{
				key: 'ids',
				label: 'Document IDs',
				type: 'string',
				defaultValue: [],
				description: 'Unique IDs for each document.'
			},
			{
				key: 'documents',
				label: 'Documents',
				type: 'string',
				defaultValue: [],
				description: 'The text documents to add.'
			},
			{
				key: 'metadatas',
				label: 'Metadatas',
				type: 'string',
				defaultValue: [],
				description: 'Associated metadata for each document.'
			}
		]
	}
};

export const chromaDefinition: ServiceDefinition = {
	type: 'chroma',
	name: 'ChromaDB',
	category: SERVICE_CATEGORIES.VECTOR_DATABASE,
	defaultPort: 8000,
	docs: {
		api: 'https://docs.trychroma.com/api-reference'
	},
	authentication: {
		type: 'none'
	},
	capabilities: [vectorDatabaseCapability],
	configuration: {
		help: {
			instructions: 'Run ChromaDB via its Docker container or as a server.'
		}
	}
}; 
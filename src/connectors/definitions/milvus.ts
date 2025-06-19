import type { ServiceDefinition, VectorDatabaseCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const vectorDatabaseCapability: VectorDatabaseCapability = {
  capability: 'vector_database',
  endpoints: {
    listCollections: { path: '/v2/vectordb/collections/list', method: 'POST' },
    query: { path: '/v2/vectordb/vectors/query', method: 'POST' },
    upsert: { path: '/v2/vectordb/vectors/upsert', method: 'POST' },
    delete: { path: '/v2/vectordb/vectors/delete', method: 'POST' }
  },
  parameters: {
    query: [
      {
        key: 'collectionName',
        label: 'Collection Name',
        type: 'string',
        defaultValue: '',
        description: 'The name of the collection to query.'
      },
      {
        key: 'vector',
        label: 'Query Vector',
        type: 'string', // Should be an array of floats, UI will need to handle this
        defaultValue: '[]',
        description: 'The vector to search for.'
      },
      {
        key: 'limit',
        label: 'Limit',
        type: 'number',
        defaultValue: 10,
        description: 'The number of results to return.'
      },
      {
        key: 'filter',
        label: 'Filter',
        type: 'string',
        defaultValue: '',
        description: 'An expression to filter the results (e.g., "id in [1, 2, 3]").'
      }
    ],
    upsert: [
      {
        key: 'collectionName',
        label: 'Collection Name',
        type: 'string',
        defaultValue: '',
        description: 'The name of the collection to upsert into.'
      },
      {
        key: 'data',
        label: 'Data',
        type: 'string', // Should be a JSON object or array of objects, UI will need a JSON editor
        defaultValue: '{}',
        description: 'The data to upsert, as a JSON object or array of objects.'
      }
    ]
  }
};

export const milvusDefinition: ServiceDefinition = {
  type: 'milvus',
  name: 'Milvus',
  category: SERVICE_CATEGORIES.VECTOR_DATABASE,
  defaultPort: 19530,
  docs: {
    api: 'https://milvus.io/api-reference/restful/v2.4.x/v2/Vector%20(v2)/Search.md'
  },
  configuration: {
    help: {
      instructions:
        'Run Milvus via its Docker container or as a cluster. Provide the username and password for authentication.'
    }
  },
  authentication: {
    type: 'bearer_token',
    help: 'The token should be a colon-joined username and password, like `root:Milvus`'
  },
  capabilities: [vectorDatabaseCapability]
}; 
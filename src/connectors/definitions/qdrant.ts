import type { ServiceDefinition, VectorDatabaseCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

const vectorDatabaseCapability: VectorDatabaseCapability = {
  capability: 'vector_database',
  endpoints: {
    listCollections: { path: '/collections', method: 'GET' },
    query: { path: '/collections/{collection_name}/points/search', method: 'POST' },
    upsert: { path: '/collections/{collection_name}/points', method: 'PUT' },
    delete: { path: '/collections/{collection_name}/points/delete', method: 'POST' }
  },
  parameters: {
    query: [
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
        type: 'string', // Should be a JSON object, UI will need a JSON editor
        defaultValue: '{}',
        description: 'A filter to apply to the search.'
      }
    ],
    upsert: [
      {
        key: 'points',
        label: 'Points',
        type: 'string', // Array of Qdrant PointStruct objects, UI will need a JSON editor
        defaultValue: '[]',
        description: 'An array of points to upsert, including id, vector, and payload.'
      }
    ]
  }
};

export const qdrantDefinition: ServiceDefinition = {
  type: 'qdrant',
  name: 'Qdrant',
  category: SERVICE_CATEGORIES.VECTOR_DATABASE,
  defaultPort: 6333,
  docs: {
    api: 'https://qdrant.tech/documentation/concepts/points/'
  },
  configuration: {
    help: {
      instructions: 'Run Qdrant via its official Docker container.'
    }
  },
  authentication: {
    type: 'api_key',
    keyName: 'api-key'
  },
  capabilities: [vectorDatabaseCapability]
}; 
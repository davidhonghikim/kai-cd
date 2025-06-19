import type { ServiceDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

export const milvusDefinition: ServiceDefinition = {
  type: 'milvus',
  name: 'Milvus',
  category: SERVICE_CATEGORIES.VECTOR_DATABASE,
  defaultPort: 19530,
  isCorsCompliant: true,
  endpoints: {},
}; 
import type { ServiceDefinition } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';

export const qdrantDefinition: ServiceDefinition = {
  type: 'qdrant',
  name: 'Qdrant',
  category: SERVICE_CATEGORIES.VECTOR_DATABASE,
  defaultPort: 6333,
  isCorsCompliant: true,
  endpoints: {},
}; 
import type { ServiceConfig } from '@/types';
import type { Service } from '@/types';

/**
 * Default configuration values for services
 */
export const DEFAULT_CONFIG = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  max_tokens: 2048,
  stop: [] as string[],
};

/**
 * Validate service configuration
 */
export function validateServiceConfig(config: Partial<ServiceConfig>): string[] {
  const errors: string[] = [];

  if (!config.url) {
    errors.push('Service URL is required');
  }

  if (config.requiresApiKey && !config.apiKey) {
    errors.push('API key is required for this service');
  }

  if (!config.type) {
    errors.push('Service type is required');
  }

  if (!config.category) {
    errors.push('Service category is required');
  }

  return errors;
}

/**
 * Merge service configuration with defaults
 */
export function mergeServiceConfig(
  config: Partial<ServiceConfig>,
  defaults: Partial<ServiceConfig> = {}
): ServiceConfig {
  return {
    ...defaults,
    ...config,
  } as ServiceConfig;
}

/**
 * Convert Service to ServiceConfig
 */
export function serviceToConfig(service: Service): ServiceConfig {
  return {
    id: service.id,
    name: service.name,
    type: service.type,
    url: service.url,
    category: service.type as any, // TODO: Fix this type conversion
    apiKey: service.apiKey,
    requiresApiKey: !!service.apiKey,
    enabled: service.enabled || true,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    isActive: service.isActive,
    status: service.status || 'inactive',
  };
}

/**
 * Convert ServiceConfig to Service
 */
export function configToService(config: ServiceConfig): Service {
  return {
    id: config.id || `service_${Date.now()}`,
    name: config.name || 'New Service',
    type: config.type,
    url: config.url || '',
    status: config.status || 'inactive',
    apiKey: config.apiKey,
    enabled: config.enabled || true,
    requiresApiKey: config.requiresApiKey || false,
    createdAt: config.createdAt || Date.now(),
    updatedAt: config.updatedAt || Date.now(),
    isActive: typeof config.isActive === 'boolean' ? config.isActive : false,
    category: config.category || 'llm',
  };
} 
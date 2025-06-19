/* global console */
import type { Service } from '@/types';
import { SERVICE_TYPES } from '@/config/constants';
import { RequestHandler } from './types';
import { connectorManager } from '../connectors';
import { storageManager } from '../../storage/storageManager';
import { SERVICE_TYPE_TO_CATEGORY, HEALTH_CHECK_PATHS } from '../../config/constants';
import { SERVERS_KEY } from '../../utils/settingsIO';
import { DEFAULT_SERVICES } from '../../config/defaults';
import { getStoredServices } from '../utils/storage';

// @ts-ignore
// Temporarily use 'any' for service types to get a build
type ServiceAny = any;

// Function to initialize default services
async function initializeDefaultServices() {
  console.log('Initializing default services...');
  try {
    const existingServices = await getStoredServices();
    console.log('Existing services:', existingServices);

    if (!existingServices || existingServices.length === 0) {
      console.log('No services found, creating default services...');
      const servicesWithIds = DEFAULT_SERVICES.map((service: any) => ({
        ...service,
        id: `${service.type}-${Date.now()}`,
        category: SERVICE_TYPE_TO_CATEGORY[service.type as keyof typeof SERVICE_TYPE_TO_CATEGORY]
      }));
      await storageManager.set(SERVERS_KEY, servicesWithIds);
      console.log('Default services created successfully:', servicesWithIds);
    } else {
      console.log(`Found ${existingServices.length} existing services.`);
    }
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
}

// Message handler for getServices
export const getServices: RequestHandler<undefined, { success: boolean; services: Service[]; error?: string }> = async (_payload, _sender, sendResponse) => {
  try {
    console.log('Getting services...');
    const services = await getStoredServices();
    console.log('Retrieved services:', services);
    if (!services || !Array.isArray(services)) {
      console.warn('No services found or invalid format, initializing defaults...');
      await initializeDefaultServices();
      const defaultServices = await getStoredServices();
      sendResponse({ success: true, services: defaultServices });
      return true;
    }
    sendResponse({ success: true, services });
    return true;
  } catch (error) {
    console.error('Error getting services:', error);
    try {
      sendResponse({ success: false, services: [], error: 'Failed to get services' });
    } catch (e) {
      console.error('sendResponse failed:', e);
    }
    return true;
  }
};

export async function addService(payload: Partial<Service>): Promise<Service> {
  const services = await getStoredServices();
  const serviceType = payload.type || SERVICE_TYPES.OLLAMA;
  const newService: Service = {
    id: `srv_${Date.now()}`,
    name: payload.name || 'New Service',
    type: serviceType,
    url: payload.url || '',
    apiKey: payload.apiKey,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: payload.isActive ?? false,
    status: 'inactive',
    category: SERVICE_TYPE_TO_CATEGORY[serviceType],
    requiresApiKey: false,
    enabled: true
  };

  const updatedServices = [...services, newService];
  await storageManager.set(SERVERS_KEY, updatedServices);
  return newService;
}

export async function updateService(payload: Service): Promise<Service> {
  const services = await getStoredServices();
  const index = services.findIndex((s) => s.id === payload.id);

  if (index === -1) {
    throw new Error('Service not found');
  }

  const updatedService = {
    ...services[index],
    updatedAt: Date.now()
  };

  const updatedServices = [...services];
  updatedServices[index] = updatedService;

  // Get the connector and update it
  const connector = await connectorManager.getConnector(updatedService);
  if (connector) {
    await connector.updateService(updatedService);
  }

  await storageManager.set(SERVERS_KEY, updatedServices);
  return updatedService;
}

export async function removeService(payload: { id: string }): Promise<Service[]> {
  const services = await getStoredServices();
  const updatedServices = services.filter(s => s.id !== payload.id);

  connectorManager.removeConnector(payload.id);
  await storageManager.set(SERVERS_KEY, updatedServices);
  return updatedServices;
}

export async function setDefaultModel(payload: { serviceId: string; modelId: string }): Promise<Service> {
  const { serviceId } = payload;
  const services = await getStoredServices();
  const index = services.findIndex((s) => s.id === serviceId);

  if (index === -1) {
    throw new Error(`Service not found with id: ${serviceId}`);
  }

  const updatedService: Service = {
    ...services[index],
    updatedAt: Date.now(),
  };

  const updatedServices = [...services];
  updatedServices[index] = updatedService;

  await storageManager.set(SERVERS_KEY, updatedServices);
  return updatedService;
}

/**
 * Checks if a service is online and reachable.
 * It uses a fetch request with a timeout to prevent long hangs.
 * It will also check for a valid response (e.g., 200 OK).
 */
export async function checkStatus(payload: { serviceId: string }): Promise<{
  status: 'online' | 'offline' | 'error';
  message?: string;
  statusCode?: number;
}> {
  const services = await getStoredServices();
  const service = services.find((s) => s.id === payload.serviceId);

  if (!service || !service.url) {
    return { status: 'error', message: `Service not found or has no URL.` };
  }
  
  const healthCheckPath = HEALTH_CHECK_PATHS[service.type] || '';
  const healthCheckUrl = new URL(healthCheckPath, service.url).toString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const response = await fetch(healthCheckUrl, {
      method: 'GET', // Use GET for broader compatibility, HEAD is not always supported.
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { status: 'online', statusCode: response.status };
    } else {
      return {
        status: 'offline',
        message: `Service returned non-OK status: ${response.status}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'offline', message: 'Connection timed out after 5 seconds.' };
    }
    return { status: 'offline', message: 'Failed to connect. The server may be offline or unreachable.' };
  }
}

export const getModels = async (payload: { serviceId: string }) => {
  const { serviceId } = payload;
  if (!serviceId) throw new Error('Service ID is required to fetch models.');

  const services = await getStoredServices();
  const service = services.find(s => s.id === serviceId);

  if (!service) throw new Error(`Service with ID "${serviceId}" not found.`);

  // For now, only handle Ollama. This will be expanded.
  if (service.type !== SERVICE_TYPES.OLLAMA) {
    console.log(`Model fetching not supported for service type: ${service.type}`);
    return [];
  }

  try {
    // Ollama's API endpoint for listing models is /api/tags
    const url = new URL('/api/tags', service.url).toString();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch models from ${service.name}. Status: ${response.status}`);
    }
    const data = await response.json();
    
    // The response has a "models" array with model objects
    return data.models.map((model: { name: string; [key: string]: any }) => ({
      id: model.name,
      name: model.name,
      details: model,
    }));
  } catch (error) {
    console.error(`Error fetching models for ${service.name}:`, error);
    throw error;
  }
};

/**
 * Exports selected services to a JSON file.
 */
export const exportServices: RequestHandler<{ serviceIds: string[] }, { success: boolean; data?: string; error?: string }> = async (payload, _sender, sendResponse) => {
  try {
    const { serviceIds } = payload;
    const services = await getStoredServices();
    const servicesToExport = services.filter(service => serviceIds.includes(service.id));
    const data = JSON.stringify(servicesToExport, null, 2);
    sendResponse({ success: true, data });
  } catch (error) {
    console.error('Error exporting services:', error);
    sendResponse({ success: false, error: 'Failed to export services' });
  }
};

/**
 * Imports services from a JSON file.
 */
export const importServices: RequestHandler<{ services: Service[] }, { success: boolean; error?: string }> = async (payload, _sender, sendResponse) => {
  try {
    const { services } = payload;
    const existingServices = await getStoredServices();
    const updatedServices = [...existingServices, ...services];
    await storageManager.set(SERVERS_KEY, updatedServices);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error importing services:', error);
    sendResponse({ success: false, error: 'Failed to import services' });
  }
};

/**
 * Updates the order of services in storage.
 */
export const updateServicesOrder: RequestHandler<{ orderedIds: string[] }, { success: boolean; error?: string }> = async (payload, _sender, sendResponse) => {
  try {
    const { orderedIds } = payload;
    const services = await getStoredServices();
    const orderedServices = orderedIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
    await storageManager.set(SERVERS_KEY, orderedServices);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating services order:', error);
    sendResponse({ success: false, error: 'Failed to update services order' });
  }
};

/**
 * Gets the currently active service.
 */
export const getActiveService: RequestHandler = async (_payload, _sender, sendResponse) => {
  try {
    const services = await getStoredServices();
    const activeService = services.find(s => s.isActive);
    sendResponse({ success: true, service: activeService || null });
  } catch (error) {
    console.error('Error getting active service:', error);
    sendResponse({ success: false, error: 'Failed to get active service' });
  }
};

export const serviceHandlers = {
  getServices,
  addService,
  updateService,
  removeService,
  checkStatus,
  getModels,
  exportServices,
  importServices,
  updateServicesOrder,
  getActiveService,
  setDefaultModel
};

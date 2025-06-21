import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { allServiceDefinitions } from '../connectors/definitions/all';
import { config } from '../config/env';
import type { Service, NewService, HealthCapability, ChatMessage } from '../types';
import { apiClient } from '../utils/apiClient';
import { ollamaDefinition } from '../connectors/definitions/ollama';
import { openWebUIDefinition } from '../connectors/definitions/open-webui';
import { a1111Definition } from '../connectors/definitions/a1111';
import { comfyuiDefinition } from '../connectors/definitions/comfyui';
import { openAICompatibleDefinition } from '../connectors/definitions/openai-compatible';
import { ApiError } from '../utils/apiClient';

export type { Service } from '../types';

const buildServiceUrl = (data: { ipType: 'local' | 'remote' | 'cloud' | 'custom', customUrl?: string, port: number }): string => {
  if (data.ipType === 'custom' || data.ipType === 'cloud') {
    return data.customUrl || '';
  }
  const ip = data.ipType === 'local' ? config.networking.localIp : config.networking.remoteIp;
  if (!ip) return '';
  return `http://${ip}:${data.port}`;
};

const createService = (serviceData: NewService): Service => {
  const definition = allServiceDefinitions.find(def => def.type === serviceData.serviceDefinitionId);
  if (!definition) throw new Error(`Service definition not found for type: ${serviceData.serviceDefinitionId}`);
  const url = buildServiceUrl({ ...serviceData, port: definition.defaultPort });
  return {
    ...definition,
    ...serviceData,
    id: uuidv4(),
    name: serviceData.name,
    url,
    enabled: true,
    status: 'unknown',
    lastChecked: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  };
};

/**
 * Creates the initial list of default services in a direct, explicit manner.
 * No more complex templates or mappings.
 */
export const getInitialDefaultServices = (): Service[] => {
  const services: Service[] = [];
  const { localIp, remoteIp } = config.networking;

  const boilerplate = {
    id: uuidv4(),
    enabled: true,
    status: 'unknown' as const,
    lastChecked: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    history: [],
  };

  const defaultLocalDefs = [ollamaDefinition, openWebUIDefinition, a1111Definition, comfyuiDefinition];
  const defaultRemoteDefs = [ollamaDefinition, openWebUIDefinition, a1111Definition, comfyuiDefinition];

  if (localIp) {
    defaultLocalDefs.forEach(def => {
      services.push({
        ...boilerplate,
        ...def,
        id: uuidv4(),
        serviceDefinitionId: def.type,
        name: `${def.name} (${localIp})`,
        ipType: 'local',
        url: `http://${localIp}:${def.defaultPort}`,
      });
    });
  }

  if (remoteIp) {
    defaultRemoteDefs.forEach(def => {
      services.push({
        ...boilerplate,
        ...def,
        id: uuidv4(),
        serviceDefinitionId: def.type,
        name: `${def.name} (${remoteIp})`,
        ipType: 'remote',
        url: `http://${remoteIp}:${def.defaultPort}`,
      });
    });
  }
  
  // Add cloud services
  services.push({
    ...boilerplate,
    ...openAICompatibleDefinition,
    id: uuidv4(),
    serviceDefinitionId: 'openai-compatible',
    name: 'OpenAI API',
    ipType: 'cloud',
    url: 'https://api.openai.com/v1',
    customUrl: 'https://api.openai.com/v1',
  });

  return services;
};

export interface ServiceState {
  services: Service[];
  selectedServiceId: string | null;
  customUrls: string[];
  addService: (serviceData: NewService) => void;
  updateService: (service: Partial<Service> & { id: string }) => void;
  removeService: (serviceId: string) => void;
  setSelectedServiceId: (serviceId: string | null) => void;
  setServices: (services: Service[]) => void;
  getServiceById: (serviceId:string) => Service | undefined;
  addCustomUrl: (url: string) => void;
  updateCustomUrl: (oldUrl: string, newUrl: string) => void;
  removeCustomUrl: (url: string) => void;
  addMessageToHistory: (serviceId: string, message: ChatMessage) => void;
  _hasHydrated: boolean;
  updateServiceLastUsedModel: (serviceId: string, modelId: string) => void;
  checkServiceStatus: (service: Service) => Promise<void>;
  startPeriodicStatusCheck: () => number;
  stopPeriodicStatusCheck: (intervalId: number) => void;
  // Service management functions
  sortServices: (sortBy: 'name' | 'status' | 'type' | 'lastChecked') => void;
  toggleServiceArchive: (serviceId: string) => void;
}

const chromeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(name);
    return result[name] || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [name]: value });
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.remove(name);
  },
};

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: [],
      selectedServiceId: null,
      customUrls: [],
      _hasHydrated: false,

      getServiceById: (serviceId) => {
        return get().services.find((s) => s.id === serviceId);
      },

      addService: (serviceData) => {
        try {
          const newService = createService(serviceData);
          set((state) => ({ services: [...state.services, newService] }));
          if (newService.ipType === 'custom' && newService.url) {
            get().addCustomUrl(newService.url);
          }
        } catch (error) {
          console.error("Failed to add service:", error);
        }
      },

      updateService: (updatedService) => {
        set((state) => {
          const services = state.services.map((service) => {
            if (service.id === updatedService.id) {
              const mergedServiceData = { ...service, ...updatedService };

              // Re-fetch definition to get the correct port if type changed
              const definition = allServiceDefinitions.find(d => d.type === mergedServiceData.type);
              const port = definition?.defaultPort || service.defaultPort;

              // Re-build the URL based on the updated data
              const url = buildServiceUrl({ ...mergedServiceData, port });

              if (updatedService.ipType === 'custom' && url) {
                get().addCustomUrl(url);
              }

              return { ...mergedServiceData, url, updatedAt: Date.now() };
            }
            return service;
          });
          return { services };
        });
      },
      
      addMessageToHistory: (serviceId, message) => {
        set((state) => ({
          services: state.services.map((service) => {
            if (service.id === serviceId) {
              const history = service.history || [];
              return { ...service, history: [...history, message] };
            }
            return service;
          }),
        }));
      },
      
      addCustomUrl: (url: string) => {
        set(state => {
          if (state.customUrls.includes(url)) {
            return state;
          }
          return { customUrls: [...state.customUrls, url] };
        });
      },

      updateCustomUrl: (oldUrl, newUrl) => {
        set(state => {
          // Prevent adding a duplicate if the new URL already exists
          if (state.customUrls.includes(newUrl)) {
            // Just remove the old one
            return { customUrls: state.customUrls.filter(u => u !== oldUrl) };
          }
          // Otherwise, replace the old with the new
          return {
            customUrls: state.customUrls.map(u => u === oldUrl ? newUrl : u)
          };
        });
      },

      removeCustomUrl: (urlToRemove) => {
        set(state => ({
          customUrls: state.customUrls.filter(u => u !== urlToRemove)
        }));
      },

      setServices: (services) => set({ services }),

      removeService: (serviceId) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== serviceId),
          selectedServiceId:
            state.selectedServiceId === serviceId ? null : state.selectedServiceId,
        }));
      },

      setSelectedServiceId: (serviceId) => {
        set({ selectedServiceId: serviceId });
      },
      
      updateServiceLastUsedModel: (serviceId: string, modelId: string) => {
        set(state => ({
            services: state.services.map(service => 
                service.id === serviceId ? { ...service, lastUsedModel: modelId } : service
            ),
        }));
      },

      checkServiceStatus: async (serviceToCheck) => {
        const { updateService } = get();
        updateService({ id: serviceToCheck.id, status: 'checking', lastChecked: Date.now() });
        
        const healthCapability = serviceToCheck.capabilities.find(c => c.capability === 'health') as HealthCapability | undefined;
        if (!healthCapability) {
          // For services without health endpoints, try a basic connectivity test
          try {
            const response = await fetch(serviceToCheck.url, { 
              method: 'HEAD', 
              mode: 'no-cors',
              signal: AbortSignal.timeout(5000) 
            });
            updateService({ id: serviceToCheck.id, status: 'online', lastChecked: Date.now() });
          } catch (error) {
            updateService({ id: serviceToCheck.id, status: 'offline', lastChecked: Date.now() });
          }
          return;
        }

        try {
          await apiClient.get(serviceToCheck.id, healthCapability.endpoints.health.path);
          updateService({ id: serviceToCheck.id, status: 'online', lastChecked: Date.now() });
        } catch (error) {
          if (error instanceof ApiError) {
            updateService({ id: serviceToCheck.id, status: 'offline', lastChecked: Date.now() });
          } else {
            updateService({ id: serviceToCheck.id, status: 'error', lastChecked: Date.now() });
          }
        }
      },

      // Add periodic status checking
      startPeriodicStatusCheck: () => {
        const checkInterval = setInterval(() => {
          const state = get();
          const activeServices = state.services.filter(s => !s.archived && s.enabled);
          
          activeServices.forEach(service => {
            // Only check if it's been more than 2 minutes since last check
            const timeSinceLastCheck = Date.now() - service.lastChecked;
            if (timeSinceLastCheck > 120000) { // 2 minutes
              state.checkServiceStatus(service);
            }
          });
        }, 60000); // Check every minute
        
        return checkInterval;
      },

      stopPeriodicStatusCheck: (intervalId: number) => {
        clearInterval(intervalId);
      },

      // Service management functions
      sortServices: (sortBy) => {
        set((state) => {
          const sorted = [...state.services].sort((a, b) => {
            switch (sortBy) {
              case 'name':
                return a.name.localeCompare(b.name);
              case 'status':
                const statusOrder = { 'online': 0, 'checking': 1, 'offline': 2, 'error': 3, 'unknown': 4 };
                return statusOrder[a.status] - statusOrder[b.status];
              case 'type':
                return a.type.localeCompare(b.type);
              case 'lastChecked':
                return b.lastChecked - a.lastChecked;
              default:
                return 0;
            }
          });
          return { services: sorted };
        });
      },

      toggleServiceArchive: (serviceId) => {
        set((state) => {
          const services = state.services.map((service) => {
            if (service.id === serviceId) {
              return { ...service, archived: !service.archived, updatedAt: Date.now() };
            }
            return service;
          });
          return { services };
        });
      },
    }),
    {
      name: 'service-storage',
      storage: createJSONStorage(() => chromeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            // For first-time users, if the services array is empty after hydration,
            // populate it with the default services.
            if (state.services.length === 0 && config.developer.loadDefaultServices) {
                console.log("No services found in storage, populating with defaults.");
                state.services = getInitialDefaultServices();
            } else {
                // Migration: Update existing services with correct URLs and authentication based on current config
                const { localIp, remoteIp } = config.networking;
                let needsUpdate = false;
                
                const updatedServices = state.services.map(service => {
                    let updatedService = { ...service };
                    
                    // URL Migration: Update URLs for local/remote services
                    if (service.ipType === 'local' || service.ipType === 'remote') {
                        const expectedIp = service.ipType === 'local' ? localIp : remoteIp;
                        const expectedUrl = `http://${expectedIp}:${service.defaultPort}`;
                        
                        if (service.url !== expectedUrl) {
                            console.log(`🔄 Migrating service "${service.name}" URL from ${service.url} to ${expectedUrl}`);
                            updatedService.url = expectedUrl;
                            updatedService.updatedAt = Date.now();
                            needsUpdate = true;
                        }
                    }
                    
                    // Authentication Migration: Remove credentials from services that don't need them
                    const definition = allServiceDefinitions.find(d => d.type === service.type);
                    if (definition && definition.authentication.type === 'none' && service.credentialId) {
                        console.log(`🔄 Removing unnecessary credential from "${service.name}" (${service.type})`);
                        updatedService.credentialId = undefined;
                        updatedService.updatedAt = Date.now();
                        needsUpdate = true;
                    }
                    
                    return updatedService;
                });
                
                if (needsUpdate) {
                    state.services = updatedServices;
                    console.log("✅ Service configurations updated to match current definitions");
                }
            }
        }
        useServiceStore.setState({ _hasHydrated: true });
      },
      partialize: (state) => {
        const { _hasHydrated, ...rest } = state;
        return rest;
      },
    },
  ),
); 
import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { allServiceDefinitions } from '../connectors/definitions/all';
import { config } from '../config/env';
import { DEFAULT_SERVICES } from '../config/defaults';
import type { Service, ServiceDefinition, AuthDefinition, ServiceType } from '../types';

export type { Service } from '../types';

// This is a subset of the main Service type for creation purposes.
type NewServiceData = Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'capabilities' | 'category' | 'enabled' | 'url' >> & {
    type: ServiceType;
    url: string;
    authentication?: AuthDefinition;
};

export interface ServiceState {
  services: Service[];
  selectedServiceId: string | null;
  addService: (serviceData: NewServiceData) => void;
  updateService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setSelectedServiceId: (serviceId: string | null) => void;
  setServices: (services: Service[]) => void;
  getServiceById: (serviceId: string) => Service | undefined;
  addMessageToHistory: (serviceId: string, message: { role: 'user' | 'assistant' | 'system'; content: string }) => void;
  _hasHydrated: boolean;
  updateServiceLastUsedModel: (serviceId: string, modelId: string) => void;
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
      _hasHydrated: false,

      getServiceById: (serviceId) => get().services.find((s) => s.id === serviceId),

      addService: (serviceData) => {
        const definition = allServiceDefinitions.find((def) => def.type === serviceData.type);
        if (!definition) return;

        const newService: Service = {
          ...definition,
          ...serviceData,
          id: uuidv4(),
          enabled: true,
          status: 'unknown',
          lastChecked: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          authentication: serviceData.authentication || definition.authentication,
          history: [],
        };
        set((state) => ({ services: [...state.services, newService] }));
      },

      updateService: (updatedService) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === updatedService.id ? { ...service, ...updatedService, updatedAt: Date.now() } : service
          ),
        }));
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
    }),
    {
      name: 'kai-cd-service-storage-v6', // Incremented version for migration
      storage: createJSONStorage(() => chromeStorage), // Use chrome.storage.local for extensions
      version: 6,
      migrate: (persistedState, version) => {
        if (version < 6) {
            // For older states, just clear them to avoid complex migrations for now.
            // This will cause users to lose their services, but avoids crashes.
            // A more graceful migration could be written here if needed.
            return { services: [], selectedServiceId: null, _hasHydrated: false };
        }
        return persistedState as ServiceState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          if (state.services.length === 0) {
            console.log("No services found, loading default services.");
            const defaultServices: Service[] = DEFAULT_SERVICES.map((s) => {
              const definition = allServiceDefinitions.find(d => d.type === s.type);
              return {
                ...definition!,
                ...s,
                id: uuidv4(),
                enabled: true,
                status: 'unknown',
                lastChecked: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                history: [],
              };
            });
            state.services = defaultServices;
            state.selectedServiceId = defaultServices[0]?.id || null;
          }
        }
      },
    }
  )
); 
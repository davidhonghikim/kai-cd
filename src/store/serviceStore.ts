import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { allServiceDefinitions } from '../connectors/definitions/all';
import { config } from '../config/env';
import { DEFAULT_SERVICES } from '../config/defaults';
import type { Service, ServiceDefinition } from '../types';

export type { Service } from '../types';

// This is a subset of the main Service type for creation purposes.
type NewServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'authentication' | 'capabilities' | 'category' | 'enabled' >;

export interface ServiceState {
  services: Service[];
  selectedServiceId: string | null;
  addService: (serviceData: NewServiceData) => void;
  updateService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  setSelectedServiceId: (serviceId: string | null) => void;
  setServices: (services: Service[]) => void;
  getServiceById: (serviceId: string) => Service | undefined;
  _hasHydrated: boolean;
  updateServiceLastUsedModel: (serviceId: string, modelId: string) => void;
}

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
          status: undefined, // Let status be checked on load
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isActive: false,
          isConnected: false,
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
      name: 'kai-cd-service-storage-v5', // Incremented version for migration
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState, version) => {
        if (version < 5) {
            // For older states, just clear them to avoid complex migrations for now.
            // This will cause users to lose their services, but avoids crashes.
            // A more graceful migration could be written here if needed.
            return { services: [], selectedServiceId: null, _hasHydrated: false };
        }
        return persistedState as ServiceState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.services.length === 0) {
            const defaultServices: Service[] = DEFAULT_SERVICES.map((s) => {
              const definition = allServiceDefinitions.find((def) => def.type === s.type);
              if (!definition) throw new Error(`Definition not found for ${s.type}`);

              let ip = s.name.includes('(Local)') ? config.networking.localIp : config.networking.remoteIp;
              const port = definition?.defaultPort;
              const url = `http://${ip}:${port}`;
              
              return {
                ...definition,
                id: uuidv4(),
                name: s.name,
                url: url,
                enabled: s.enabled,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isActive: false,
                isConnected: false,
              };
            });
            state.services = defaultServices;
            state.selectedServiceId = defaultServices[0]?.id || null;
          }
          state._hasHydrated = true;
        }
      },
    }
  )
); 
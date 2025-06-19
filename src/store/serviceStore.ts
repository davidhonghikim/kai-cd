import { create } from 'zustand';
import type { Service, ChatMessage, GeneratedImage } from '../types';
import { DEFAULT_SERVICES } from '../config/defaults';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface ServiceState {
  services: Service[];
  selectedServiceId: string | null;
  selectedService: Service | null;
  chatHistory: Record<string, ChatMessage[]>;
  imageGallery: GeneratedImage[];
  getServiceById: (id: string) => Service | undefined;
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isActive' | 'isConnected'>) => void;
  updateService: (id: string, serviceUpdate: Partial<Service>) => void;
  removeService: (id: string) => void;
  setSelectedServiceId: (id: string | null) => void;
  updateServiceStatus: (id: string, status: Service['status']) => void;
  addChatMessage: (serviceId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: (serviceId: string) => void;
  addImageToGallery: (image: Omit<GeneratedImage, 'id' | 'timestamp'>) => void;
  removeImageFromGallery: (imageId: string) => void;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,
      selectedServiceId: null,
      selectedService: null,
      chatHistory: {},
      imageGallery: [],

      getServiceById: (id: string) => {
        return get().services.find((service) => service.id === id);
      },

      addService: (service) => {
        const newService: Service = {
          ...service,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'unknown',
          isActive: false,
          isConnected: false,
        };
        set((state) => ({ services: [...state.services, newService] }));
      },

      updateService: (id, serviceUpdate) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...serviceUpdate, updatedAt: Date.now() } : service
          ),
        }));
      },

      removeService: (id) => {
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        }));
      },

      setSelectedServiceId: (id) => {
        const service = get().services.find((s) => s.id === id);
        set({ selectedServiceId: id, selectedService: service || null });
      },
      
      updateServiceStatus: (id, status) => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, status } : service
          ),
        }));
      },

      addChatMessage: (serviceId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: uuidv4(),
          timestamp: Date.now(),
        };
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [serviceId]: [...(state.chatHistory[serviceId] || []), newMessage],
          },
        }));
      },

      clearChatHistory: (serviceId) => {
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [serviceId]: [],
          },
        }));
      },

      addImageToGallery: (image) => {
        const newImage: GeneratedImage = {
          ...image,
          id: uuidv4(),
          timestamp: Date.now(),
        };
        set((state) => ({ imageGallery: [newImage, ...state.imageGallery] }));
      },

      removeImageFromGallery: (imageId) => {
        set((state) => ({
          imageGallery: state.imageGallery.filter((image) => image.id !== imageId),
        }));
      },
    }),
    {
      name: 'kai-cd-service-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
); 
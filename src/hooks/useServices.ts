import { createContext, useContext, useState } from 'react';
import { Service } from '../types';
import { DEFAULT_SERVICES } from '../config/defaults';

interface ServiceContextType {
  services: Service[];
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  removeService: (serviceId: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);

  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const updateService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const removeService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  return (
    <ServiceContext.Provider value={{ services, addService, updateService, removeService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}; 
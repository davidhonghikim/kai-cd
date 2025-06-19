import React from 'react';
import type { Service } from '../store/serviceStore';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string | null) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
  services, 
  selectedServiceId, 
  onSelectService 
}) => {
  return (
    <select
      value={selectedServiceId || ''}
      onChange={(e) => onSelectService(e.target.value)}
      className="bg-slate-700 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <option value="" disabled>Select a service...</option>
      {services.map((service) => (
        <option key={service.id} value={service.id}>
          {service.name}
        </option>
      ))}
    </select>
  );
};

export default ServiceSelector; 
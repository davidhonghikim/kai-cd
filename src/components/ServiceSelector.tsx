import React from 'react';
import type { Service } from '../types';
import { useModelList } from '../hooks/useModelList';
import { useServiceStore } from '../store/serviceStore';
import type { TabView } from '../store/viewStateStore';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string | null) => void;
  activeView: TabView;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
  services, 
  selectedServiceId, 
  onSelectService,
  activeView
}) => {
  const { models } = useModelList(selectedServiceId, activeView);
  const { updateServiceLastUsedModel, getServiceById } = useServiceStore();

  const selectedService = getServiceById(selectedServiceId || '');

  const handleModelChange = (modelId: string) => {
    if (selectedServiceId) {
      updateServiceLastUsedModel(selectedServiceId, modelId);
    }
  };

  return (
    <div className="flex space-x-2">
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

      {models.length > 0 && (
        <select
          value={selectedService?.lastUsedModel || ''}
          onChange={(e) => handleModelChange(e.target.value)}
          className="bg-slate-700 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="" disabled>Select a model...</option>
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ServiceSelector; 
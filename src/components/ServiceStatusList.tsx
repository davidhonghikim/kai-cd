import React from 'react';
import StatusIndicator from './StatusIndicator';
import { useServiceStore } from '../store/serviceStore';

const ServiceStatusList: React.FC = () => {
  const { services, checkServiceStatus } = useServiceStore();

  return (
    <div className="flex items-center space-x-2 border-r border-slate-700 pr-4 mr-2">
      {services.map(service => (
        <button 
            key={service.id} 
            onClick={() => checkServiceStatus(service)}
            className="group relative"
            title={`Click to refresh status. Current: ${service.status}`}
        >
          <StatusIndicator status={service.status} />
          <span className="absolute bottom-full mb-2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {service.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ServiceStatusList; 
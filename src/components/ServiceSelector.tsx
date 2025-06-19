import React from 'react';
import { useServiceStore } from '../store/serviceStore';

const ServiceSelector: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId } = useServiceStore();

  return (
    <nav>
      <ul>
        {services.map((service) => (
          <li key={service.id} className="mb-1">
            <button
              className={`w-full p-2 text-left rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedServiceId === service.id ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => setSelectedServiceId(service.id)}
            >
              <span className="font-semibold">{service.name}</span>
              <span className="block text-xs text-gray-400">{service.category}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ServiceSelector; 
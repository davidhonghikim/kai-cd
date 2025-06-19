import React, { useState } from 'react';
import { useServiceStore } from '../store/serviceStore';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import AddServiceForm from './AddServiceForm';
import type { Service } from '../types';

const ServiceManagement: React.FC = () => {
  const { services, removeService } = useServiceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(undefined);

  const handleAddClick = () => {
    setServiceToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setServiceToEdit(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Services</h3>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Service
        </button>
      </div>

      {isModalOpen && <AddServiceForm onClose={handleCloseModal} serviceToEdit={serviceToEdit} />}

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="p-4 bg-gray-800 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{service.name}</p>
              <p className="text-sm text-gray-400">Type: {service.type}</p>
              <p className="text-sm text-gray-400">URL: {service.url}</p>
              <p className="text-sm text-gray-400">Status: {service.status}</p>
            </div>
            <div className="flex items-center space-x-2">
               <button
                onClick={() => handleEditClick(service)}
                className="p-2 bg-gray-600 rounded-md hover:bg-gray-700"
                title="Edit Service"
              >
                <PencilIcon className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
                    removeService(service.id);
                  }
                }}
                className="p-2 bg-red-600 rounded-md hover:bg-red-700"
                title="Delete Service"
              >
                <TrashIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceManagement; 
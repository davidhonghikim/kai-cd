import React, { useState, useEffect } from 'react';
import { useServiceStore } from '../store/serviceStore';
import { allServiceDefinitions } from '../connectors/definitions/all';
import type { Service, ServiceDefinition, ServiceType, AuthDefinition } from '../types';

interface AddServiceFormProps {
  onClose: () => void;
  serviceToEdit?: Service;
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({ onClose, serviceToEdit }) => {
  const [selectedType, setSelectedType] = useState<ServiceType | ''>(serviceToEdit?.type || '');
  const [serviceName, setServiceName] = useState(serviceToEdit?.name || '');
  const [serviceUrl, setServiceUrl] = useState(serviceToEdit?.url || '');
  const [authDetails, setAuthDetails] = useState<Record<string, any>>(serviceToEdit?.authentication || {});
  const { addService, updateService } = useServiceStore();

  const selectedDefinition = allServiceDefinitions.find(def => def.type === selectedType);
  const isEditMode = !!serviceToEdit;

  useEffect(() => {
    if (serviceToEdit) {
      setSelectedType(serviceToEdit.type);
      setServiceName(serviceToEdit.name);
      setServiceUrl(serviceToEdit.url);
      setAuthDetails(serviceToEdit.authentication || {});
    }
  }, [serviceToEdit]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ServiceType;
    setSelectedType(type);
    const def = allServiceDefinitions.find(d => d.type === type);
    if (def) {
      setServiceUrl(`http://localhost:${def.defaultPort}`);
      setServiceName(def.name);
      setAuthDetails({});
    }
  };

  const handleAuthChange = (key: string, value: string) => {
    setAuthDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefinition) return;

    if (isEditMode) {
      const updatedService: Partial<Service> = {
        name: serviceName,
        url: serviceUrl,
        authentication: {
          ...selectedDefinition.authentication,
          ...authDetails,
        } as AuthDefinition,
      };
      updateService(serviceToEdit.id, updatedService);
    } else {
      const newService: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isActive' | 'isConnected'> = {
        name: serviceName,
        type: selectedDefinition.type,
        url: serviceUrl,
        enabled: true,
        category: selectedDefinition.category,
        authentication: {
          ...selectedDefinition.authentication,
          ...authDetails,
        } as AuthDefinition,
        capabilities: selectedDefinition.capabilities,
      };
      addService(newService);
    }
    
    onClose();
  };
  
  const renderAuthFields = () => {
    if (!selectedDefinition || selectedDefinition.authentication.type === 'none') {
      return null;
    }

    const auth = selectedDefinition.authentication;
    switch (auth.type) {
      case 'api_key':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300">{auth.keyName || 'API Key'}</label>
            <input
              type="password"
              value={authDetails.apiKey || ''}
              onChange={(e) => handleAuthChange('apiKey', e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        );
      // Other auth types can be added here
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit Service' : 'Add a New Service'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="service-type" className="block text-sm font-medium text-gray-300">Service Type</label>
            <select
              id="service-type"
              value={selectedType}
              onChange={handleTypeChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isEditMode}
            >
              <option value="" disabled>Select a type...</option>
              {allServiceDefinitions.map(def => (
                <option key={def.type} value={def.type}>{def.name}</option>
              ))}
            </select>
          </div>

          {selectedDefinition && (
            <>
              <div>
                <label htmlFor="service-name" className="block text-sm font-medium text-gray-300">Display Name</label>
                <input
                  type="text"
                  id="service-name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="service-url" className="block text-sm font-medium text-gray-300">URL</label>
                <input
                  type="text"
                  id="service-url"
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              {renderAuthFields()}
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700" disabled={!selectedDefinition}>
              {isEditMode ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceForm; 
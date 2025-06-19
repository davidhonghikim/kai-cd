import React, { useState, useEffect, useMemo } from 'react';
import { useServiceStore, type Service } from '../store/serviceStore';
import type { ServiceType, AuthDefinition, ServiceDefinition, LlmChatCapability } from '../types';
import { allServiceDefinitions } from '../connectors/definitions/all';

interface AddServiceFormProps {
  onClose: () => void;
  serviceToEdit?: Service | null;
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({ onClose, serviceToEdit }) => {
  const { services, addService, updateService } = useServiceStore();
  
  const [selectedType, setSelectedType] = useState<ServiceType | ''>(serviceToEdit?.type || '');
  const [serviceName, setServiceName] = useState(serviceToEdit?.name || '');
  const [serviceUrl, setServiceUrl] = useState(serviceToEdit?.url || '');
  const [defaultModel, setDefaultModel] = useState(serviceToEdit?.lastUsedModel || '');
  const [authDetails, setAuthDetails] = useState<Record<string, any>>(
    serviceToEdit ? (serviceToEdit.authentication as any).credentials || {} : {}
  );

  const selectedDefinition = allServiceDefinitions.find(def => def.type === selectedType);
  const isEditMode = !!serviceToEdit;

  const existingIpAddresses = useMemo(() => {
    const ips = new Set<string>();
    services.forEach(s => {
      try {
        const url = new URL(s.url);
        ips.add(url.hostname);
      } catch (e) { /* ignore invalid urls */ }
    });
    return Array.from(ips);
  }, [services]);

  useEffect(() => {
    if (serviceToEdit) {
      setSelectedType(serviceToEdit.type);
      setServiceName(serviceToEdit.name);
      setServiceUrl(serviceToEdit.url);
      setDefaultModel(serviceToEdit.lastUsedModel || '');
      setAuthDetails((serviceToEdit.authentication as any).credentials || {});
    }
  }, [serviceToEdit]);

  const handleTypeChange = (type: ServiceType) => {
    setSelectedType(type);
    const def = allServiceDefinitions.find((d: ServiceDefinition) => d.type === type);
    if (def) {
      setServiceUrl(`http://localhost:${def.defaultPort}`);
      setServiceName(def.name);
      setAuthDetails({});
    }
  };

  const handleIpSelect = (ip: string) => {
    if(selectedDefinition) {
        setServiceUrl(`http://${ip}:${selectedDefinition.defaultPort}`);
    }
  }

  const handleAuthChange = (key: string, value: string) => {
    setAuthDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefinition) return;

    let finalAuth: AuthDefinition = { ...selectedDefinition.authentication };
    
    if (finalAuth.type === 'api_key' || finalAuth.type === 'bearer_token' || finalAuth.type === 'basic') {
      finalAuth.credentials = authDetails;
    }

    if (isEditMode && serviceToEdit) {
      const updatedService: Service = {
        ...serviceToEdit,
        name: serviceName,
        url: serviceUrl,
        authentication: finalAuth,
        lastUsedModel: defaultModel,
      };
      updateService(updatedService);
    } else {
      addService({
        name: serviceName,
        type: selectedDefinition.type,
        url: serviceUrl,
        authentication: finalAuth,
      });
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

  const llmCapability = selectedDefinition?.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full">
      <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">{isEditMode ? 'Edit Service' : 'Add a New Service'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="service-type" className="block text-sm font-medium text-gray-300">Service Type</label>
          <select
            id="service-type"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value as ServiceType)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isEditMode}
          >
            <option value="" disabled>Select a type...</option>
            {allServiceDefinitions.map((def: ServiceDefinition) => (
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
              <label htmlFor="service-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="service-url"
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
                <select onChange={(e) => handleIpSelect(e.target.value)} className="mt-1 block w-auto bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="">Use IP...</option>
                    {existingIpAddresses.map(ip => <option key={ip} value={ip}>{ip}</option>)}
                </select>
              </div>
            </div>
            {isEditMode && llmCapability && (
                 <div>
                    <label htmlFor="default-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Model</label>
                    <input
                        type="text"
                        id="default-model"
                        value={defaultModel}
                        onChange={e => setDefaultModel(e.target.value)}
                        placeholder="e.g., gpt-4o, llama3"
                        className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            )}
            {renderAuthFields()}
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                {isEditMode ? 'Save Changes' : 'Add Service'}
                </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AddServiceForm; 
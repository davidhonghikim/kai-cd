import React, { useState, useEffect } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import type { LlmChatCapability } from '../../types';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';
import type { Service } from '../../store/serviceStore';

interface ModelSelectorProps {
  service: Service;
  capability: LlmChatCapability;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  service,
  capability,
  selectedModel,
  onModelChange,
}) => {
  const [models, setModels] = useState<{ id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      const modelsEndpoint = capability.endpoints.getModels;
      if (!modelsEndpoint) return;

      setIsLoading(true);
      try {
        const response = await apiClient.get(
          service.url,
          modelsEndpoint.path,
          service.authentication
        );
        
        // This logic needs to be flexible based on API response structure
        const modelsData = response.data || response;
        if (Array.isArray(modelsData)) {
            setModels(modelsData.map(m => ({ id: m.id || m.name })));
        }

      } catch (error) {
        toast.error(`Failed to fetch models: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [service, capability]);

  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading models...</div>;
  }
  
  if (models.length === 0) {
    return <div className="text-sm font-semibold">{selectedModel || 'Default Model'}</div>;
  }

  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="appearance-none w-full bg-transparent font-semibold text-lg pr-8 focus:outline-none"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.id}
          </option>
        ))}
      </select>
      <ChevronUpDownIcon className="h-5 w-5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default ModelSelector; 
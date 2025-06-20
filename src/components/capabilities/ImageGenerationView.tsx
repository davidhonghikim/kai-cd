import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { CapabilityViewProps, ImageGenerationCapability, GraphExecutionCapability, ParameterDefinition } from '../../types';
import { apiClient } from '../../utils/apiClient';
import ParameterControl from './ParameterControl';

const ImageGenerationView: React.FC<CapabilityViewProps<ImageGenerationCapability>> = ({ service, capability }) => {
  const [params, setParams] = useState<Record<string, any>>({});

  useEffect(() => {
    const defaultParams: Record<string, any> = {};
    const parameters = capability.parameters.txt2img || capability.parameters.text_to_image || [];
    parameters.forEach(p => {
        defaultParams[p.key] = p.defaultValue;
    });
    setParams(defaultParams);
  }, [capability]);

  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleParamChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImages([]);
    try {
      const endpoint = capability.endpoints.txt2img || capability.endpoints.text_to_image;
      if (!endpoint) throw new Error('Text-to-image endpoint not defined');
      
      let payload: any = params;
      
      const graphCapability = service.capabilities.find(c => c.capability === 'graph_execution') as GraphExecutionCapability | undefined;

      if (graphCapability) {
        // Create a deep copy of the base workflow to modify it
        const workflow = JSON.parse(JSON.stringify(graphCapability.baseWorkflow));
        
        // Inject user-defined parameters into the workflow
        for (const [paramKey, mapping] of Object.entries(graphCapability.parameterMapping)) {
            if (params[paramKey] !== undefined) {
                workflow[mapping.nodeId].inputs[mapping.inputKey] = params[paramKey];
            }
        }
        payload = { prompt: workflow };
      }
      
      const response = await apiClient.post(service.id, endpoint.path, payload);
      
      let imageUrls: string[] = [];
      if (service.type === 'comfyui') {
        const historyResponse = await apiClient.get(service.id, '/history');
        const lastPrompt = historyResponse[Object.keys(historyResponse)[0]];
        if (lastPrompt.outputs) {
          for (const nodeOutput of Object.values(lastPrompt.outputs)) {
            if ((nodeOutput as any).images) {
              (nodeOutput as any).images.forEach((img: any) => {
                const url = apiClient.buildUrl(service.url, `/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
                imageUrls.push(url);
              });
            }
          }
        }
      } else if (response.images && Array.isArray(response.images)) {
        imageUrls = response.images.map((img: string) => `data:image/png;base64,${img}`);
      } else {
        toast.error('Received an unexpected image format.');
      }
      setImages(imageUrls);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeParameters = capability.parameters.txt2img || capability.parameters.text_to_image;
  if (!activeParameters) {
    return (
        <div className="p-4 text-red-400">
            <h3 className="font-bold">Configuration Error</h3>
            <p>No valid 'txt2img' or 'text_to_image' parameter sets found for this service.</p>
        </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 p-4 border-r border-slate-700 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Image Parameters</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeParameters.map((param: ParameterDefinition) => (
                <ParameterControl 
                key={param.key}
                param={param}
                value={params[param.key]}
                onChange={handleParamChange}
                />
            ))}
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full px-4 py-2 mt-4 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-500"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </form>
      </div>
      <div className="w-2/3 p-4 flex items-center justify-center bg-slate-900">
        {isLoading && <p className="text-slate-400">Generating images...</p>}
        {!isLoading && images.length === 0 && <p className="text-slate-500">Your generated images will appear here.</p>}
        <div className="grid grid-cols-2 gap-4">
            {images.map((imgSrc, index) => (
            <img key={index} src={imgSrc} alt={`Generated image ${index + 1}`} className="max-w-full rounded-lg shadow-lg" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationView; 
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { CapabilityViewProps, ImageGenerationCapability, GraphExecutionCapability, ParameterDefinition } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { useServiceStore } from '../../store/serviceStore';
import ParameterControl from './ParameterControl';

interface GeneratedImage {
  url: string;
  prompt: string;
  parameters: Record<string, any>;
  timestamp: number;
  id: string;
}

const ImageGenerationView: React.FC<CapabilityViewProps<ImageGenerationCapability>> = ({ service, capability }) => {
  const [params, setParams] = useState<Record<string, any>>({});
  const { updateService } = useServiceStore();

  useEffect(() => {
    const defaultParams: Record<string, any> = {};
    const parameters = capability.parameters.txt2img || capability.parameters.text_to_image || [];
    parameters.forEach(p => {
        defaultParams[p.key] = p.defaultValue;
    });
    setParams(defaultParams);
  }, [capability]);

  const [images, setImages] = useState<GeneratedImage[]>(service.imageHistory || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleParamChange = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const saveImageToHistory = (imageUrls: string[], prompt: string, parameters: Record<string, any>) => {
    const newImages: GeneratedImage[] = imageUrls.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      prompt,
      parameters,
      timestamp: Date.now()
    }));
    
    const updatedImages = [...newImages, ...images].slice(0, 50); // Keep last 50 images
    setImages(updatedImages);
    
    // Persist to service store
    updateService({ 
      id: service.id, 
      imageHistory: updatedImages 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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
      
      console.log('[ImageGeneration] Sending payload:', payload);
      const response = await apiClient.post(service.id, endpoint.path, payload);
      console.log('[ImageGeneration] Received response:', response);
      
      let imageUrls: string[] = [];
      if (service.type === 'comfyui') {
        // Wait a bit for ComfyUI to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
        console.error('[ImageGeneration] Unexpected response format:', response);
        toast.error('Received an unexpected image format.');
        return;
      }
      
      if (imageUrls.length > 0) {
        saveImageToHistory(imageUrls, params.prompt || '', params);
        toast.success(`Generated ${imageUrls.length} image(s) successfully!`);
      } else {
        toast.error('No images were generated. Check the service logs.');
      }

    } catch (error) {
      console.error('[ImageGeneration] Error:', error);
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
                <ParameterControl service={service} 
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
      <div className="w-2/3 p-4 overflow-y-auto bg-slate-900">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400">Generating images...</p>
            </div>
          </div>
        )}
        {!isLoading && images.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Your generated images will appear here.</p>
          </div>
        )}
        {images.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-200">Generated Images ({images.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="bg-slate-800 rounded-lg p-4">
                  <img 
                    src={image.url} 
                    alt={`Generated: ${image.prompt}`} 
                    className="w-full rounded-lg shadow-lg mb-2" 
                    onError={(e) => {
                      console.error('Image failed to load:', image.url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-slate-400">
                    <p className="truncate" title={image.prompt}>
                      <strong>Prompt:</strong> {image.prompt || 'No prompt'}
                    </p>
                    <p>{new Date(image.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationView;

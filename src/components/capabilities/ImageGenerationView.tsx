import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { ImageGenerationCapability, ParameterDefinition } from '../../types';
import ParameterControl from './ParameterControl';
import { useServiceStore } from '../../store/serviceStore';
import { apiClient } from '../../utils/apiClient';

interface ImageGenerationViewProps {
  capability: ImageGenerationCapability;
}

const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ capability }) => {
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>(Object.keys(capability.parameters)[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { selectedService, addImageToGallery } = useServiceStore();

  useEffect(() => {
    // Initialize form state with default values when the capability or tab changes
    const initialFormState: Record<string, any> = {};
    const params = capability.parameters[activeTab];
    if (params) {
      params.forEach((param) => {
        initialFormState[param.key] = param.defaultValue;
      });
    }
    setFormState(initialFormState);
  }, [capability, activeTab]);

  const handleParameterChange = (key: string, value: any) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      if (!selectedService) throw new Error('No service selected');

      const endpoint = capability.endpoints[activeTab];
      if (!endpoint) throw new Error(`Endpoint for ${activeTab} not found.`);

      const response = await apiClient.post(selectedService.url, endpoint.path, formState);

      // NOTE: Response structure varies. A1111 returns images in an `images` array.
      if (response.images && response.images.length > 0) {
        const imageB64 = response.images[0];
        const newImageUrl = `data:image/png;base64,${imageB64}`;
        setImageUrl(newImageUrl);

        // Save to gallery
        addImageToGallery({
          serviceId: selectedService.id,
          imageData: imageB64,
          prompt: formState.prompt || 'No prompt provided',
        });
      } else {
        throw new Error('No image found in the response.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderParameters = (parameters: ParameterDefinition[]) => {
    return parameters.map((param) => (
      <ParameterControl
        key={param.key}
        definition={param}
        value={formState[param.key]}
        onChange={(value) => handleParameterChange(param.key, value)}
      />
    ));
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-2">Image Generation</h3>
      <div className="border-b border-gray-600 mb-4">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {Object.keys(capability.parameters).map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`${
                activeTab === tabName
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              {tabName}
            </button>
          ))}
        </nav>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {capability.parameters[activeTab] && renderParameters(capability.parameters[activeTab])}
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>
      {isLoading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 p-2 bg-red-800 text-white rounded-md">{error}</div>}
      {imageUrl && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Result</h4>
          <img src={imageUrl} alt="Generated" className="max-w-full h-auto rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerationView; 
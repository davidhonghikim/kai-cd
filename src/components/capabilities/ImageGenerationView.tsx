import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { CapabilityViewProps } from '../../types';
import { apiClient } from '../../utils/apiClient';
import ParameterControl from './ParameterControl';

const ImageGenerationView: React.FC<CapabilityViewProps<'image_generation'>> = ({ service, capability }) => {
  const [params, setParams] = useState<Record<string, any>>({
    prompt: 'A beautiful landscape',
    n_iter: 1,
    steps: 20,
    width: 512,
    height: 512,
  });
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
      const endpoint = capability.endpoints.text_to_image;
      if (!endpoint) throw new Error('Text-to-image endpoint not defined');
      
      const response = await apiClient.post(service.url, endpoint.path, params);
      
      // Assuming the API returns images as an array of base64 strings
      // This will need to be adapted based on the actual API response format
      if (response.images && Array.isArray(response.images)) {
        setImages(response.images.map((img: string) => `data:image/png;base64,${img}`));
      } else {
        toast.error('Received an unexpected image format.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {capability.parameters.text_to_image.map(param => (
            <ParameterControl 
              key={param.key}
              param={param}
              value={params[param.key]}
              onChange={handleParamChange}
            />
          ))}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Images'}
        </button>
      </form>
      <div>
        {isLoading && <p>Loading...</p>}
        {images.map((imgSrc, index) => (
          <img key={index} src={imgSrc} alt={`Generated image ${index + 1}`} style={{ maxWidth: '100%', marginTop: '10px' }} />
        ))}
      </div>
    </div>
  );
};

export default ImageGenerationView; 
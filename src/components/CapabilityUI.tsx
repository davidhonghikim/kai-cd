import React from 'react';
import { useServiceStore } from '../store/serviceStore';
import LlmChatView from './capabilities/LlmChatView';
import ImageGenerationView from './capabilities/ImageGenerationView';

const CapabilityUI: React.FC = () => {
  const { selectedService } = useServiceStore();

  if (!selectedService) {
    return <div className="p-4 text-gray-400">Select a service to see its capabilities.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{selectedService.name}</h2>
      {selectedService.capabilities.map((capability, index) => {
        switch (capability.capability) {
          case 'llm_chat':
            return <LlmChatView key={index} capability={capability} />;
          case 'image_generation':
            return <ImageGenerationView key={index} capability={capability} />;
          // Add cases for other capabilities here
          default:
            return <div key={index}>Unsupported capability: {(capability as any).capability}</div>;
        }
      })}
    </div>
  );
};

export default CapabilityUI; 
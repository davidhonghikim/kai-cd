import React, { type FC } from 'react';
import LlmChatView from './LlmChatView';
import ImageGenerationView from './ImageGenerationView';
import type { CapabilityViewProps, ServiceCapability } from '../../types';

type CapabilityComponent = FC<CapabilityViewProps<any>>;

// A map of capability names to the React components that render them.
// By using Partial<...>, we indicate that we only implement a subset of all
// possible capabilities, making the registry more maintainable.
const capabilityRegistry: Partial<Record<ServiceCapability['capability'], CapabilityComponent>> = {
  llm_chat: LlmChatView,
  image_generation: ImageGenerationView,
};

export const getCapabilityView = (capabilityName: ServiceCapability['capability']): CapabilityComponent | null => {
  return capabilityRegistry[capabilityName] || null;
}

// A simple component to render a fallback for unknown capabilities.
export const UnknownCapabilityView: FC<{ capability: ServiceCapability }> = ({
  capability,
}) => (
  <div style={{ padding: '10px', border: '1px solid #fdd835', backgroundColor: '#fffde7', color: '#fbc02d' }}>
    <h3 style={{ fontWeight: 'bold' }}>Unsupported Capability</h3>
    <p>
      The UI for the capability <strong>{capability.capability}</strong> has not been implemented.
    </p>
  </div>
); 
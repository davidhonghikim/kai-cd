import React from 'react';
import type { Service } from '../types';
import { getCapabilityView, UnknownCapabilityView } from './capabilities/registry';

interface CapabilityUIProps {
  service: Service;
}

// A whitelist of capabilities that have a dedicated UI view.
const RENDERABLE_CAPABILITIES: ReadonlyArray<string> = ['llm_chat', 'image_generation'];

const CapabilityUI: React.FC<CapabilityUIProps> = ({ service }) => {
  // Find the first capability of the service that is in our whitelist of renderable views.
  const primaryCapability = service.capabilities.find(cap => 
    RENDERABLE_CAPABILITIES.includes(cap.capability)
  );

  if (!primaryCapability) {
    // If no renderable capabilities are found, show a generic message.
    // This prevents trying to render a view for 'model_management' or other non-UI capabilities.
    const firstCapability = service.capabilities[0];
    if (!firstCapability) {
      return <div>No capabilities defined for this service.</div>;
    }
    return <UnknownCapabilityView capability={firstCapability} />;
  }

  const ViewComponent = getCapabilityView(primaryCapability.capability);

  // This check should technically be redundant now, but it's good practice.
  return ViewComponent ? (
    <ViewComponent service={service} capability={primaryCapability} />
  ) : (
    <UnknownCapabilityView capability={primaryCapability} />
  );
};

export default CapabilityUI; 
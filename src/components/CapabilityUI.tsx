import React from 'react';
import type { Service } from '../types';
import { getCapabilityView, UnknownCapabilityView } from './capabilities/registry';

interface CapabilityUIProps {
  service: Service;
}

const CapabilityUI: React.FC<CapabilityUIProps> = ({ service }) => {
  // For now, we will render the UI for the FIRST compatible capability.
  // This avoids cluttering the UI with multiple views (e.g., chat and model management).
  // A future enhancement could be to add tabs to switch between capabilities.
  const primaryCapability = service.capabilities.find(cap => getCapabilityView(cap.capability));

  if (!primaryCapability) {
    // If no capabilities have a registered view, show a generic message
    // or the first capability's "unknown" view.
    const firstCapability = service.capabilities[0];
    if (!firstCapability) {
      return <div>No capabilities defined for this service.</div>;
    }
    return <UnknownCapabilityView capability={firstCapability} />;
  }

  const ViewComponent = getCapabilityView(primaryCapability.capability);

  return ViewComponent ? (
    <ViewComponent service={service} capability={primaryCapability} />
  ) : (
    <UnknownCapabilityView capability={primaryCapability} />
  );
};

export default CapabilityUI; 
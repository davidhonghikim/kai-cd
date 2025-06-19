import React from 'react';
import type { Service } from '../types';
import { getCapabilityView } from './capabilities/registry';

interface CapabilityUIProps {
  service: Service;
}

const CapabilityUI: React.FC<CapabilityUIProps> = ({ service }) => {
  return (
    <div>
      {service.capabilities.map(cap => {
        const ViewComponent = getCapabilityView(cap.capability);
        if (ViewComponent) {
          // The key should ideally be more unique if capabilities can be duplicated
          return <ViewComponent key={cap.capability} service={service} capability={cap} />;
        }
        return (
          <div key={cap.capability}>
            <p>
              Warning: No UI registered for capability: <strong>{cap.capability}</strong>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CapabilityUI; 
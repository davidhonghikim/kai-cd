import React from 'react';
import styles from '@/styles/components/ServiceFeatures.module.css';
import { Service, ServiceType } from '@/types';
import { SERVICE_TYPES } from '@/config/constants';

interface ServiceFeaturesProps {
  service: Service;
  features: Record<string, boolean>;
}

const ServiceFeatures: React.FC<ServiceFeaturesProps> = ({ service, features }) => {
  const getServiceFeatures = (type: ServiceType) => {
    switch (type) {
      case SERVICE_TYPES.OPEN_WEBUI:
        return [
          { id: 'chat', label: 'Chat Interface', defaultEnabled: true },
          { id: 'models', label: 'Model Management', defaultEnabled: true },
          { id: 'settings', label: 'Settings', defaultEnabled: true }
        ];
      case SERVICE_TYPES.A1111:
        return [
          { id: 'txt2img', label: 'Text to Image', defaultEnabled: true },
          { id: 'img2img', label: 'Image to Image', defaultEnabled: true },
          { id: 'extras', label: 'Extras', defaultEnabled: true },
          { id: 'settings', label: 'Settings', defaultEnabled: true }
        ];
      case SERVICE_TYPES.COMFY_UI:
        return [
          { id: 'workflow', label: 'Workflow Editor', defaultEnabled: true },
          { id: 'queue', label: 'Queue Management', defaultEnabled: true },
          { id: 'settings', label: 'Settings', defaultEnabled: true }
        ];
      default:
        return [];
    }
  };

  const serviceFeatures = getServiceFeatures(service.type);

  if (serviceFeatures.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Service Features</h3>
      <div className={styles.featuresList}>
        {Object.entries(features).map(([feature, enabled]) => (
          <span
            key={feature}
            className={`${styles.featureTag} ${enabled ? styles.enabled : styles.disabled}`}
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ServiceFeatures; 
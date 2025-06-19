import React, { useState } from 'react';
import styles from '@/styles/components/ServiceConfig.module.css';
import { Service } from '@/types';
import { SERVICE_TYPES } from '@/config/constants';

interface ServiceConfigProps {
  service: Service;
  onConfigChange: (config: Record<string, any>) => void;
}

const ServiceConfig: React.FC<ServiceConfigProps> = ({ service, onConfigChange }) => {
  const [config, setConfig] = useState<Record<string, any>>(service.config || {});

  const getServiceConfigFields = (type: string) => {
    switch (type) {
      case SERVICE_TYPES.OPEN_WEBUI:
        return [
          { id: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark', 'system'] },
          { id: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1 }
        ];
      case SERVICE_TYPES.A1111:
        return [
          { id: 'sampler', label: 'Default Sampler', type: 'text' },
          { id: 'steps', label: 'Default Steps', type: 'number', min: 1, max: 150 },
          { id: 'cfg_scale', label: 'CFG Scale', type: 'number', min: 1, max: 30, step: 0.5 }
        ];
      case SERVICE_TYPES.COMFY_UI:
        return [
          { id: 'workflow', label: 'Default Workflow', type: 'text' },
          { id: 'queue_size', label: 'Queue Size', type: 'number', min: 1, max: 100 }
        ];
      default:
        return [];
    }
  };

  const handleChange = (id: string, value: any) => {
    const newConfig = { ...config, [id]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const fields = getServiceConfigFields(service.type);

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Service Configuration</h3>
      <div className={styles.fieldsList}>
        {fields.map(field => (
          <div key={field.id} className={styles.fieldItem}>
            <label className={styles.fieldLabel}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                value={config[field.id] || (field as any).options?.[0] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={styles.select}
              >
                {(field as any).options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={config[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                min={field.min}
                max={field.max}
                step={field.step}
                className={styles.input}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceConfig; 
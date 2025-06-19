import React, { useState } from 'react';
import styles from '@/styles/components/ServiceTemplates.module.css';
import { Service, ServiceType } from '@/types';
import { SERVICE_TYPES } from '@/config/constants';

interface ServiceTemplatesProps {
  onTemplateSelect: (template: Service) => void;
}

interface ServiceTemplate {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  config: Record<string, any>;
  features: Record<string, boolean>;
}

const ServiceTemplates: React.FC<ServiceTemplatesProps> = ({ onTemplateSelect }) => {
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all');

  const templates: ServiceTemplate[] = [
    {
      id: 'open-webui-default',
      name: 'Open WebUI Default',
      type: SERVICE_TYPES.OPEN_WEBUI,
      description: 'Default configuration for Open WebUI with chat and model management enabled.',
      config: {
        theme: 'system',
        // model: 'llama2',
        temperature: 0.7
      },
      features: {
        chat: true,
        models: true,
        settings: true
      }
    },
    {
      id: 'a1111-basic',
      name: 'A1111 Basic',
      type: SERVICE_TYPES.A1111,
      description: 'Basic configuration for A1111 with text-to-image generation.',
      config: {
        sampler: 'Euler a',
        steps: 20,
        cfg_scale: 7
      },
      features: {
        txt2img: true,
        img2img: false,
        extras: false,
        settings: true
      }
    },
    {
      id: 'comfy-ui-stable',
      name: 'ComfyUI Stable',
      type: SERVICE_TYPES.COMFY_UI,
      description: 'Stable configuration for ComfyUI with workflow editor.',
      config: {
        workflow: 'default',
        queue_size: 10
      },
      features: {
        workflow: true,
        queue: true,
        settings: true
      }
    }
  ];

  const filteredTemplates = selectedType === 'all'
    ? templates
    : templates.filter(template => template.type === selectedType);

  const handleTemplateSelect = (template: ServiceTemplate) => {
    const service: Service = {
      id: template.id,
      name: template.name,
      type: template.type,
      url: '',
      enabled: true,
      status: 'inactive',
      category: 'llm' as any, // TODO: Fix this type conversion
      requiresApiKey: false,
      features: Object.keys(template.features),
      config: {
        id: template.id,
        name: template.name,
        type: template.type,
        url: '',
        enabled: true,
        status: 'inactive',
        category: 'llm' as any, // TODO: Fix this type conversion
        requiresApiKey: false,
        features: Object.keys(template.features),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: false
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: false
    };
    onTemplateSelect(service);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Service Templates</h3>
      <div className={styles.typeFilter}>
        <button
          className={`${styles.filterButton} ${selectedType === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedType('all')}
        >
          All
        </button>
        {Object.values(SERVICE_TYPES).map(type => (
          <button
            key={type}
            className={`${styles.filterButton} ${selectedType === type ? styles.active : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className={styles.templatesGrid}>
        {filteredTemplates.map(template => (
          <div key={template.id} className={styles.templateCard}>
            <h4 className={styles.templateName}>{template.name}</h4>
            <p className={styles.templateDescription}>{template.description}</p>
            <div className={styles.templateFeatures}>
              {Object.entries(template.features).map(([feature, enabled]) => (
                <span
                  key={feature}
                  className={`${styles.featureTag} ${enabled ? styles.enabled : styles.disabled}`}
                >
                  {feature}
                </span>
              ))}
            </div>
            <button
              className={styles.useTemplateButton}
              onClick={() => handleTemplateSelect(template)}
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTemplates; 
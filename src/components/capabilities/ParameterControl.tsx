import React, { useState, useEffect } from 'react';
import type { ParameterDefinition, Service } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { logger } from '../../utils/logger';

interface ParameterControlProps {
  param: ParameterDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
  service?: Service; // Add service to fetch dynamic options
}

interface SelectOption {
  value: string;
  label: string;
}

const ParameterControl: React.FC<ParameterControlProps> = ({ param, value, onChange, service }) => {
  const { key, type, label, description, range, step } = param;
  const id = `param-${key}`;
  
  const [dynamicOptions, setDynamicOptions] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Load dynamic options for select controls with optionsEndpoint
  useEffect(() => {
    if (type === 'select' && param.optionsEndpoint && service) {
      loadDynamicOptions();
    }
  }, [type, param.optionsEndpoint, service?.id]);

  const loadDynamicOptions = async () => {
    if (!param.optionsEndpoint || !service) return;

    setIsLoadingOptions(true);
    setOptionsError(null);

    try {
      logger.debug('[ParameterControl] Loading options:', { 
        paramKey: key, 
        endpoint: param.optionsEndpoint,
        serviceId: service.id 
      });

      // Find the endpoint in service capabilities
      const endpoint = findEndpointInService(service, param.optionsEndpoint);
      if (!endpoint) {
        throw new Error(`Endpoint '${param.optionsEndpoint}' not found in service capabilities`);
      }

      const response = await apiClient.get(service.id, endpoint.path);
      logger.debug('[ParameterControl] Raw response:', { response });

      // Parse response based on parameter configuration
      const options = parseOptionsResponse(response, param);
      logger.debug('[ParameterControl] Parsed options:', { options });

      setDynamicOptions(options);

      // Set default value if none selected
      if (!value && options.length > 0) {
        onChange(key, options[0].value);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load options';
      logger.error('[ParameterControl] Failed to load options:', { 
        paramKey: key, 
        endpoint: param.optionsEndpoint,
        error: errorMessage 
      });
      setOptionsError(errorMessage);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const findEndpointInService = (service: Service, endpointName: string) => {
    for (const capability of service.capabilities) {
      if ('endpoints' in capability && capability.endpoints) {
        const endpoints = capability.endpoints as Record<string, any>;
        if (endpoints[endpointName]) {
          return endpoints[endpointName];
        }
      }
    }
    return null;
  };

  const parseOptionsResponse = (response: any, param: ParameterDefinition): SelectOption[] => {
    try {
      let data = response;

      // Navigate to the data using optionsPath if specified
      if (param.optionsPath) {
        const pathParts = param.optionsPath.split('.');
        for (const part of pathParts) {
          if (part && data && typeof data === 'object') {
            data = data[part];
          }
        }
      }

      // Handle different response formats
      if (Array.isArray(data)) {
        return data.map((item, index) => {
          if (typeof item === 'string') {
            return { value: item, label: item };
          } else if (typeof item === 'object' && item !== null) {
            const value = param.optionsValueKey ? item[param.optionsValueKey] : item.value || item.name || item.id || String(index);
            const label = param.optionsLabelKey ? item[param.optionsLabelKey] : item.label || item.title || item.name || value;
            return { value: String(value), label: String(label) };
          }
          return { value: String(item), label: String(item) };
        });
      } else if (typeof data === 'object' && data !== null) {
        // Handle object responses (like ComfyUI's nested structure)
        return Object.keys(data).map(key => ({
          value: key,
          label: key
        }));
      }

      logger.warn('[ParameterControl] Unexpected response format for options:', { data });
      return [];
    } catch (error) {
      logger.error('[ParameterControl] Error parsing options response:', { error, response });
      return [];
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    onChange(key, isNaN(num) ? 0 : num);
  };

  const renderControl = () => {
    switch (type) {
      case 'number':
        if (!range) {
          // Fallback for number without a range
          return (
            <input
              type="number"
              id={id}
              value={value ?? ''}
              step={step}
              onChange={handleNumericChange}
              className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          );
        }
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={id}
              min={range[0]}
              max={range[1]}
              step={step || 0.1}
              value={value ?? 0}
              onChange={handleNumericChange}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-1 w-16 text-center">
              {Number(value).toFixed(2)}
            </span>
          </div>
        );
      case 'boolean':
        return (
          <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={id}
              checked={!!value}
              onChange={(e) => onChange(key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
          </label>
        );
      case 'string':
        return (
          <input
            type="text"
            id={id}
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        );
      case 'select': {
        const options = dynamicOptions.length > 0 ? dynamicOptions : (param.options || []);
        const hasOptions = options.length > 0;

        return (
          <div className="space-y-1">
            <select 
              id={id} 
              value={value || ''} 
              onChange={(e) => onChange(key, e.target.value)} 
              disabled={isLoadingOptions || !hasOptions}
              className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              {isLoadingOptions && <option value="">Loading...</option>}
              {!isLoadingOptions && !hasOptions && <option value="">No options available</option>}
              {!isLoadingOptions && hasOptions && !value && <option value="">Select an option...</option>}
              {!isLoadingOptions && hasOptions && options.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={`${optionValue}-${index}`} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {optionsError && (
              <div className="text-xs text-red-400">
                Failed to load options: {optionsError}
                <button 
                  type="button"
                  onClick={loadDynamicOptions}
                  className="ml-2 text-cyan-400 hover:text-cyan-300"
                >
                  Retry
                </button>
              </div>
            )}
            {isLoadingOptions && (
              <div className="text-xs text-slate-400">Loading options from {param.optionsEndpoint}...</div>
            )}
          </div>
        );
      }
      default:
        return <p className="text-sm text-slate-500">Unsupported control type: {type}</p>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="font-semibold text-slate-800 dark:text-slate-200">{label || key}</label>
        {type === 'boolean' && renderControl()}
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {type !== 'boolean' && renderControl()}
    </div>
  );
};

export default ParameterControl;

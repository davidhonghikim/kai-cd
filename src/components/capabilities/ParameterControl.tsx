import React, { useState, useEffect } from 'react';
import type { ParameterDefinition, SelectOption } from '../../types';
import { useServiceStore } from '../../store/serviceStore';
import { apiClient } from '../../utils/apiClient';

interface ParameterControlProps {
  definition: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({ definition, value, onChange }) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const { selectedService } = useServiceStore();

  useEffect(() => {
    if (definition.type === 'select' && definition.optionsEndpoint) {
      const fetchOptions = async () => {
        if (!selectedService) return;
        try {
          const endpoint = selectedService.capabilities
            .flatMap(c => (c as any).endpoints ? Object.values((c as any).endpoints) : [])
            .find((e: any) => e.path === definition.optionsEndpoint) as any;

          if (!endpoint) {
            console.error(`Endpoint path ${definition.optionsEndpoint} not found in service definition.`);
            return;
          }

          const data = await apiClient.get(selectedService.url, endpoint.path);
          
          let items = definition.optionsPath ? data[definition.optionsPath] : data;

          const mappedOptions = items.map((item: any) => ({
            value: item[definition.optionsValueKey || 'value'],
            label: item[definition.optionsLabelKey || 'label'],
          }));
          setOptions(mappedOptions);
        } catch (error) {
          console.error(`Failed to fetch options for ${definition.key}:`, error);
        }
      };
      fetchOptions();
    } else if (definition.type === 'select' && definition.options) {
        const staticOptions = definition.options.map(opt => 
            typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
        setOptions(staticOptions);
    }
  }, [definition, selectedService]);

  const renderControl = () => {
    switch (definition.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={definition.range?.[0]}
              max={definition.range?.[1]}
              step={definition.step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-24 p-2 bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
        );
      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <div>Unsupported parameter type: {definition.type}</div>;
    }
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-300">{definition.label}</label>
      <p className="text-xs text-gray-400 mb-2">{definition.description}</p>
      {renderControl()}
    </div>
  );
};

export default ParameterControl; 
import React from 'react';
import type { ParameterDefinition } from '../../types';

interface ParameterControlProps {
  param: ParameterDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({ param, value, onChange }) => {
  const { key, type, label, description, range, step } = param;
  const id = `param-${key}`;

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
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
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
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
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
      case 'select':
        return (
          <select id={id} value={value} onChange={(e) => onChange(key, e.target.value)} className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
            {options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
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
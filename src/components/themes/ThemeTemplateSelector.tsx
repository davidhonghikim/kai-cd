import React from 'react';
import { SwatchIcon } from '@heroicons/react/24/outline';
import type { ThemePreset } from '../../types/theme';
import Tooltip from '../ui/Tooltip';

interface ThemeTemplateSelectorProps {
  templates: ThemePreset[];
  selectedTemplate: ThemePreset;
  onTemplateSelect: (template: ThemePreset) => void;
}

const ThemeTemplateSelector: React.FC<ThemeTemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect
}) => {
  const getTemplatePreview = (template: ThemePreset) => {
    const colors = template.colors;
    return (
      <div className="flex space-x-1 mb-2">
        <div 
          className="w-3 h-3 rounded-full border border-slate-300"
          style={{ 
            backgroundColor: colors.background?.primary || '#ffffff' 
          }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-slate-300"
          style={{ 
            backgroundColor: colors.interactive?.primary || '#3b82f6' 
          }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-slate-300"
          style={{ 
            backgroundColor: colors.text?.accent || colors.interactive?.primary || '#1f2937' 
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <SwatchIcon className="w-4 h-4" />
        <h3 className="text-sm font-medium">Choose Template</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {templates.map((template) => (
          <Tooltip key={template.name} content={template.description}>
            <div
              className={`
                p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${selectedTemplate.name === template.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
              onClick={() => onTemplateSelect(template)}
            >
              {getTemplatePreview(template)}
              
              <div className="space-y-1">
                <h4 className="text-xs font-medium truncate">{template.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${template.isDark 
                      ? 'bg-slate-800 text-slate-200' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {template.isDark ? 'Dark' : 'Light'}
                  </span>
                  
                  {selectedTemplate.name === template.name && (
                    <div className="text-blue-500 text-xs">✓</div>
                  )}
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ThemeTemplateSelector; 
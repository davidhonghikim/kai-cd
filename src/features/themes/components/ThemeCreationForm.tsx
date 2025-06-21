import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { THEME_TEMPLATES } from '../../../types/theme';
import { Button, Input } from '../../../shared/components/forms';

interface ThemeCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: typeof THEME_TEMPLATES[0]) => void;
}

export const ThemeCreationForm: React.FC<ThemeCreationFormProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(THEME_TEMPLATES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;
    
    onCreate(newThemeName, selectedTemplate);
    setNewThemeName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Create New Theme</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<XMarkIcon className="w-4 h-4" />}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Theme Name"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder="Enter theme name"
            fullWidth
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Choose Template
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {THEME_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedTemplate.id === template.id
                      ? 'border-cyan-500 bg-slate-700'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {template.colors.background?.primary && (
                          <div
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: template.colors.background.primary }}
                          />
                        )}
                        {template.colors.interactive?.primary && (
                          <div
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: template.colors.interactive.primary }}
                          />
                        )}
                        {template.colors.text?.accent && (
                          <div
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: template.colors.text.accent }}
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-200">{template.name}</h4>
                        <p className="text-xs text-slate-400">{template.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" variant="primary" fullWidth>
              Create Theme
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
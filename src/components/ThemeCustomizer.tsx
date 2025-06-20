import React, { useState, useEffect } from 'react';
import { 
  PaintBrushIcon, 
  PlusIcon, 
  TrashIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,SparklesIcon
} from '@heroicons/react/24/outline';
import themeManager from '../utils/themeManager';
import { type CustomTheme, type ThemePreference, THEME_TEMPLATES } from '../types/theme';
import Tooltip from './ui/Tooltip';
import toast from 'react-hot-toast';

interface ThemeCustomizerProps {
  onThemeChange?: (themeId: ThemePreference) => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onThemeChange }) => {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<ThemePreference>('system');
  const [isCreating, setIsCreating] = useState(false);
  // const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(THEME_TEMPLATES[0]);
  // const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    initializeThemes();
  }, []);

  const initializeThemes = async () => {
    try {
      await themeManager.initialize();
      setThemes(themeManager.getAllThemes());
      setActiveThemeId(themeManager.getActiveThemeId());
    } catch (error) {
      console.error('Failed to initialize themes:', error);
      toast.error('Failed to load themes');
    }
  };

  const handleThemeSelect = async (themeId: ThemePreference) => {
    try {
      await themeManager.setActiveTheme(themeId);
      setActiveThemeId(themeId);
      onThemeChange?.(themeId);
      toast.success('Theme applied successfully');
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast.error('Failed to apply theme');
    }
  };

  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    try {
      const fullColors = {
        ...selectedTemplate.colors,
        background: {
          primary: selectedTemplate.colors.background?.primary || '#0f172a',
          secondary: selectedTemplate.colors.background?.secondary || '#1e293b',
          tertiary: selectedTemplate.colors.background?.tertiary || '#334155',
          accent: selectedTemplate.colors.background?.accent || '#0ea5e9',
          surface: selectedTemplate.colors.background?.surface || '#1e293b',
          overlay: selectedTemplate.colors.background?.overlay || 'rgba(0, 0, 0, 0.8)'
        },
        text: {
          primary: selectedTemplate.colors.text?.primary || '#f8fafc',
          secondary: selectedTemplate.colors.text?.secondary || '#cbd5e1',
          tertiary: selectedTemplate.colors.text?.tertiary || '#94a3b8',
          disabled: selectedTemplate.colors.text?.disabled || '#64748b',
          inverse: selectedTemplate.colors.text?.inverse || '#0f172a',
          accent: selectedTemplate.colors.text?.accent || '#38bdf8'
        },
        border: {
          primary: selectedTemplate.colors.border?.primary || '#475569',
          secondary: selectedTemplate.colors.border?.secondary || '#334155',
          accent: selectedTemplate.colors.border?.accent || '#0ea5e9',
          focus: selectedTemplate.colors.border?.focus || '#38bdf8'
        },
        status: {
          success: selectedTemplate.colors.status?.success || '#22c55e',
          warning: selectedTemplate.colors.status?.warning || '#f59e0b',
          error: selectedTemplate.colors.status?.error || '#ef4444',
          info: selectedTemplate.colors.status?.info || '#3b82f6'
        },
        interactive: {
          primary: selectedTemplate.colors.interactive?.primary || '#0ea5e9',
          primaryHover: selectedTemplate.colors.interactive?.primaryHover || '#0284c7',
          primaryActive: selectedTemplate.colors.interactive?.primaryActive || '#0369a1',
          secondary: selectedTemplate.colors.interactive?.secondary || '#475569',
          secondaryHover: selectedTemplate.colors.interactive?.secondaryHover || '#64748b',
          secondaryActive: selectedTemplate.colors.interactive?.secondaryActive || '#334155'
        },
        shadow: {
          small: selectedTemplate.colors.shadow?.small || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          medium: selectedTemplate.colors.shadow?.medium || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          large: selectedTemplate.colors.shadow?.large || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      };

      const theme = themeManager.createTheme(newThemeName, fullColors, {
        description: `Based on ${selectedTemplate.description}`,
        isDark: selectedTemplate.isDark,
        tags: ['custom', 'template-based']
      });

      await themeManager.saveTheme(theme);
      setThemes(themeManager.getAllThemes());
      setIsCreating(false);
      setNewThemeName('');
      toast.success('Theme created successfully');
    } catch (error) {
      console.error('Failed to create theme:', error);
      toast.error('Failed to create theme');
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      await themeManager.deleteTheme(themeId);
      setThemes(themeManager.getAllThemes());
      toast.success('Theme deleted successfully');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to delete theme');
    }
  };

  const handleExportThemes = async () => {
    try {
      const customThemes = themes.filter(t => !t.isBuiltIn);
      if (customThemes.length === 0) {
        toast.error('No custom themes to export');
        return;
      }

      const exportData = await themeManager.exportThemes();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kai-cd-themes-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Themes exported successfully');
    } catch (error) {
      console.error('Failed to export themes:', error);
      toast.error('Failed to export themes');
    }
  };

  const handleImportThemes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const results = await themeManager.importThemes(content);
      
      setThemes(themeManager.getAllThemes());
      
      if (results.success > 0) {
        toast.success(`Imported ${results.success} theme(s) successfully`);
      }
      
      if (results.errors.length > 0) {
        console.error('Import errors:', results.errors);
        toast.error(`${results.errors.length} theme(s) failed to import`);
      }
    } catch (error) {
      console.error('Failed to import themes:', error);
      toast.error('Failed to import themes');
    }
  };

  const getThemePreview = (theme: CustomTheme) => {
    return (
      <div className="flex space-x-1">
        <div 
          className="w-3 h-3 rounded-full border border-slate-600"
          style={{ backgroundColor: theme.colors.background.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-slate-600"
          style={{ backgroundColor: theme.colors.interactive.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-slate-600"
          style={{ backgroundColor: theme.colors.status.success }}
        />
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <PaintBrushIcon className="h-6 w-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-slate-100">Theme Customization</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tooltip content="Create new custom theme">
            <button
              onClick={() => setIsCreating(true)}
              className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              <PlusIcon className="h-4 w-4 text-white" />
            </button>
          </Tooltip>
          
          <Tooltip content="Export custom themes">
            <button
              onClick={handleExportThemes}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 text-white" />
            </button>
          </Tooltip>
          
          <Tooltip content="Import themes">
            <label className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <DocumentArrowUpIcon className="h-4 w-4 text-white" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportThemes}
                className="hidden"
              />
            </label>
          </Tooltip>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`
              relative p-4 rounded-lg border-2 transition-all cursor-pointer
              ${activeThemeId === theme.id 
                ? 'border-cyan-400 bg-slate-700 shadow-lg' 
                : 'border-slate-600 bg-slate-750 hover:border-slate-500'
              }
            `}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-slate-100">{theme.name}</h4>
                {theme.isBuiltIn && (
                  <span className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded">
                    Built-in
                  </span>
                )}
              </div>
              
              {activeThemeId === theme.id && (
                <CheckIcon className="h-5 w-5 text-cyan-400" />
              )}
            </div>
            
            <p className="text-sm text-slate-400 mb-3">
              {theme.description || 'No description'}
            </p>
            
            <div className="flex items-center justify-between">
              {getThemePreview(theme)}
              
              {!theme.isBuiltIn && (
                <div className="flex items-center space-x-1">
                  <Tooltip content="Preview theme">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Preview functionality could be added here
                      }}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 text-slate-400" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content="Delete theme">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTheme(theme.id);
                      }}
                      className="p-1 hover:bg-red-600 rounded transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 text-red-400" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
            
            {theme.tags && theme.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {theme.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Theme Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Create New Theme</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Enter theme name..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Base Template
                </label>
                <select
                  value={selectedTemplate.name}
                  onChange={(e) => {
                    const template = THEME_TEMPLATES.find(t => t.name === e.target.value);
                    if (template) setSelectedTemplate(template);
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {THEME_TEMPLATES.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTheme}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
                >
                  Create Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-slate-700/50 rounded-md">
        <div className="flex items-center space-x-2 mb-2">
          <SparklesIcon className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-medium text-slate-300">Theme Tips</span>
        </div>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Create custom themes based on pre-designed templates</li>
          <li>• Export your themes to share with others or backup</li>
          <li>• Import theme packs from the community</li>
          <li>• Built-in themes automatically adapt to system preferences</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 
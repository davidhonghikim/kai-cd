import React, { useState, useEffect } from 'react';
import { 
  PaintBrushIcon, 
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import themeManager from '../manager/themeManager';
import { type CustomTheme, type ThemePreference, THEME_TEMPLATES } from '../../../types/theme';
import { Button } from '../../../shared/components/forms';
import { ThemeCard } from './ThemeCard';
import { ThemeCreationForm } from './ThemeCreationForm';
import toast from 'react-hot-toast';

interface ThemeCustomizerProps {
  onThemeChange?: (themeId: ThemePreference) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onThemeChange }) => {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<ThemePreference>('system');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateTheme = async (name: string, template: typeof THEME_TEMPLATES[0]) => {
    try {
      const fullColors = {
        ...template.colors,
        background: {
          primary: template.colors.background?.primary || '#0f172a',
          secondary: template.colors.background?.secondary || '#1e293b',
          tertiary: template.colors.background?.tertiary || '#334155',
          accent: template.colors.background?.accent || '#0ea5e9',
          surface: template.colors.background?.surface || '#1e293b',
          overlay: template.colors.background?.overlay || 'rgba(0, 0, 0, 0.8)'
        },
        text: {
          primary: template.colors.text?.primary || '#f8fafc',
          secondary: template.colors.text?.secondary || '#cbd5e1',
          tertiary: template.colors.text?.tertiary || '#94a3b8',
          disabled: template.colors.text?.disabled || '#64748b',
          inverse: template.colors.text?.inverse || '#0f172a',
          accent: template.colors.text?.accent || '#38bdf8'
        },
        border: {
          primary: template.colors.border?.primary || '#475569',
          secondary: template.colors.border?.secondary || '#334155',
          accent: template.colors.border?.accent || '#0ea5e9',
          focus: template.colors.border?.focus || '#38bdf8'
        },
        status: {
          success: template.colors.status?.success || '#22c55e',
          warning: template.colors.status?.warning || '#f59e0b',
          error: template.colors.status?.error || '#ef4444',
          info: template.colors.status?.info || '#3b82f6'
        },
        interactive: {
          primary: template.colors.interactive?.primary || '#0ea5e9',
          primaryHover: template.colors.interactive?.primaryHover || '#0284c7',
          primaryActive: template.colors.interactive?.primaryActive || '#0369a1',
          secondary: template.colors.interactive?.secondary || '#475569',
          secondaryHover: template.colors.interactive?.secondaryHover || '#64748b',
          secondaryActive: template.colors.interactive?.secondaryActive || '#334155'
        },
        shadow: {
          small: template.colors.shadow?.small || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          medium: template.colors.shadow?.medium || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          large: template.colors.shadow?.large || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      };

      const theme = themeManager.createTheme(name, fullColors, {
        description: `Based on ${template.description}`,
        isDark: template.isDark,
        tags: ['custom', 'template-based']
      });

      await themeManager.saveTheme(theme);
      setThemes(themeManager.getAllThemes());
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

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-100 flex items-center">
          <PaintBrushIcon className="w-6 h-6 mr-2" />
          Theme Customization
        </h3>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={handleExportThemes}
          >
            Export
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportThemes}
            className="hidden"
            id="theme-import"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<DocumentArrowUpIcon className="w-4 h-4" />}
            onClick={() => document.getElementById('theme-import')?.click()}
          >
            Import
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsCreating(true)}
          >
            Create Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={activeThemeId === theme.id}
            onSelect={handleThemeSelect}
            onDelete={!theme.isBuiltIn ? handleDeleteTheme : undefined}
          />
        ))}
      </div>

      <ThemeCreationForm
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={handleCreateTheme}
      />
    </div>
  );
}; 
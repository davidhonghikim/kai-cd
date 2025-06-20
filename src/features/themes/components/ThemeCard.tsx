import React from 'react';
import { TrashIcon, EyeIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { CustomTheme, ThemePreference } from '../../../types/theme';
import { Button } from '../../../shared/components/forms';

interface ThemeCardProps {
  theme: CustomTheme;
  isActive: boolean;
  onSelect: (themeId: ThemePreference) => void;
  onDelete?: (themeId: string) => void;
  onPreview?: (theme: CustomTheme) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isActive,
  onSelect,
  onDelete,
  onPreview
}) => {
  const getThemePreview = () => (
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
        style={{ backgroundColor: theme.colors.text.accent }}
      />
    </div>
  );

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isActive 
        ? 'border-cyan-500 bg-slate-700/50' 
        : 'border-slate-600 bg-slate-800 hover:border-slate-500'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getThemePreview()}
          <div>
            <h3 className="text-sm font-medium text-slate-200">{theme.name}</h3>
            {theme.metadata.description && (
              <p className="text-xs text-slate-400">{theme.metadata.description}</p>
            )}
          </div>
        </div>
        
        {isActive && (
          <CheckIcon className="w-5 h-5 text-green-400" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isActive ? 'secondary' : 'primary'}
            onClick={() => onSelect(theme.id as ThemePreference)}
          >
            {isActive ? 'Active' : 'Apply'}
          </Button>
          
          {onPreview && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<EyeIcon className="w-4 h-4" />}
              onClick={() => onPreview(theme)}
            >
              Preview
            </Button>
          )}
        </div>

        {!theme.isBuiltIn && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<TrashIcon className="w-4 h-4" />}
            onClick={() => onDelete(theme.id)}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}; 
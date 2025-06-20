import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import type { CustomTheme } from '../../types/theme';
import Tooltip from '../ui/Tooltip';

interface ThemePreviewProps {
  theme: CustomTheme;
  isActive: boolean;
  onSelect: (themeId: string) => void;
  onDelete?: (themeId: string) => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isActive,
  onSelect,
  onDelete
}) => {
  const getThemePreview = () => {
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
          style={{ backgroundColor: theme.colors.text.primary }}
        />
      </div>
    );
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group
        ${isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}
      onClick={() => onSelect(theme.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm truncate mr-2">{theme.name}</h3>
        {isActive && (
          <div className="text-blue-500 text-xs font-medium bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            Active
          </div>
        )}
      </div>
      
      <div className="mb-2">
        {getThemePreview()}
      </div>
      
      {theme.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
          {theme.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`
            text-xs px-2 py-1 rounded-full
            ${theme.isDark 
              ? 'bg-slate-800 text-slate-200' 
              : 'bg-yellow-100 text-yellow-800'
            }
          `}>
            {theme.isDark ? 'Dark' : 'Light'}
          </span>
          
          {!theme.isBuiltIn && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Custom
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Tooltip content="Preview theme">
            <button
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement preview functionality
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          
          {!theme.isBuiltIn && onDelete && (
            <Tooltip content="Delete theme">
              <button
                className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(theme.id);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      
      {theme.tags && theme.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {theme.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
          {theme.tags.length > 3 && (
            <span className="text-xs text-slate-500">+{theme.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemePreview; 
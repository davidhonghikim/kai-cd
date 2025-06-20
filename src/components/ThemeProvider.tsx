import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import themeManager from '../utils/themeManager';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useSettingsStore();

  useEffect(() => {
    const initializeAndApplyTheme = async () => {
      try {
        await themeManager.initialize();
        
        // If the current theme from settings is different from theme manager's active theme,
        // update the theme manager to match
        const currentActiveTheme = themeManager.getActiveThemeId();
        if (currentActiveTheme !== theme) {
          await themeManager.setActiveTheme(theme);
        } else {
          // Apply the current theme
          themeManager.applyTheme();
        }
      } catch (error) {
        console.error('Failed to initialize theme system:', error);
        // Fallback to basic theme application
        themeManager.applyTheme();
      }
    };

    initializeAndApplyTheme();
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider; 
import React, { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { config } from '../config/env';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme, _hasHydrated } = useThemeStore();

  useEffect(() => {
    // On initial load, set the theme from config if it hasn't been set by the user yet.
    if (_hasHydrated && theme === 'system') {
       setTheme(config.ui.defaultTheme);
    }
  }, [_hasHydrated, theme, setTheme]);

  // This effect runs whenever the theme changes, ensuring the class is applied.
  useEffect(() => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  return <>{children}</>;
}; 
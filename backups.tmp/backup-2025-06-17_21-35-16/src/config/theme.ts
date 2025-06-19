// Theme configuration
export type Theme = 'light' | 'dark' | 'system';

export const themes = ['light', 'dark', 'system'] as const;

export const colorVariables = {
  light: {
    // Base colors
    '--background-primary': '#ffffff',
    '--background-secondary': '#f3f4f6',
    '--background-tertiary': '#e5e7eb',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--accent-primary': '#0095ff',
    '--accent-secondary': '#0077cc',
    '--border-color': '#d1d5db',
    '--error-color': '#ef4444',
    '--success-color': '#22c55e',
    
    // Semantic colors
    '--color-info': '#3b82f6',
    '--color-warning': '#f59e0b',
    '--color-danger': '#ef4444',
    '--color-success': '#22c55e',
    
    // UI element colors
    '--button-primary-bg': '#0095ff',
    '--button-primary-text': '#ffffff',
    '--button-secondary-bg': '#f3f4f6',
    '--button-secondary-text': '#111827',
    '--input-bg': '#ffffff',
    '--input-border': '#d1d5db',
    '--input-text': '#111827',
    
    // Shadow colors
    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    '--shadow-color-hover': 'rgba(0, 0, 0, 0.15)',
  },
  dark: {
    // Base colors
    '--background-primary': '#18181b',
    '--background-secondary': '#23262f',
    '--background-tertiary': '#2d303a',
    '--text-primary': '#f3f3f3',
    '--text-secondary': '#a0a0a0',
    '--accent-primary': '#0095ff',
    '--accent-secondary': '#0077cc',
    '--border-color': '#444',
    '--error-color': '#ff4d4d',
    '--success-color': '#4dff4d',
    
    // Semantic colors
    '--color-info': '#60a5fa',
    '--color-warning': '#fbbf24',
    '--color-danger': '#f87171',
    '--color-success': '#4ade80',
    
    // UI element colors
    '--button-primary-bg': '#0095ff',
    '--button-primary-text': '#ffffff',
    '--button-secondary-bg': '#2d303a',
    '--button-secondary-text': '#f3f3f3',
    '--input-bg': '#23262f',
    '--input-border': '#444',
    '--input-text': '#f3f3f3',
    
    // Shadow colors
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--shadow-color-hover': 'rgba(0, 0, 0, 0.4)',
  },
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(isDark ? 'dark' : 'light');
  
  // Apply color variables
  const colors = isDark ? colorVariables.dark : colorVariables.light;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Update meta theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#18181b' : '#ffffff');
  }
  
  // Store theme preference
  localStorage.setItem('theme', theme);
  
  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, isDark } }));
};

export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as Theme || 'system';
  applyTheme(savedTheme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (_e: MediaQueryListEvent) => {
    applyTheme(savedTheme);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // Older browsers
    mediaQuery.addListener(handleChange);
  }
  
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.removeListener(handleChange);
    }
  };
};

export function updateTheme(theme: string): void {
  // Implementation for theme update
  console.log('Theme updated to:', theme);
} 
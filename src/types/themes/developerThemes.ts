import type { ThemePreset } from './types';

export const DEVELOPER_THEMES: ThemePreset[] = [
  {
    name: 'Teal Wave',
    description: 'Modern teal-focused palette following 2025 color trends',
    isDark: true,
    colors: {
      background: {
        primary: '#0f1419',
        secondary: '#1a2332',
        tertiary: '#2d3748',
        accent: '#4ecdc4',
        surface: '#1e2a3a',
        overlay: 'rgba(15, 20, 25, 0.95)'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        disabled: '#64748b',
        inverse: '#0f1419',
        accent: '#4ecdc4'
      },
      interactive: {
        primary: '#4ecdc4',
        primaryHover: '#3fb3b1',
        primaryActive: '#2d9490',
        secondary: '#06b6d4',
        secondaryHover: '#0891b2',
        secondaryActive: '#0e7490'
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4'
      }
    }
  },
  {
    name: 'Sunset Glow',
    description: 'Warm oranges and corals for an inviting atmosphere',
    isDark: false,
    colors: {
      background: {
        primary: '#fffbf7',
        secondary: '#fef3ec',
        tertiary: '#fed7aa',
        accent: '#fb923c',
        surface: '#ffffff',
        overlay: 'rgba(255, 251, 247, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#6b7280',
        disabled: '#9ca3af',
        inverse: '#ffffff',
        accent: '#ea580c'
      },
      interactive: {
        primary: '#fb923c',
        primaryHover: '#ea580c',
        primaryActive: '#c2410c',
        secondary: '#f97316',
        secondaryHover: '#ea580c',
        secondaryActive: '#c2410c'
      },
      status: {
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb'
      }
    }
  }
]; 
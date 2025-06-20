import type { ThemePreset } from './types';

export const LIGHT_THEMES: ThemePreset[] = [
  {
    id: 'pastel-palette',
    name: 'Pastel Palette',
    description: 'Elegant soft tones with Double Pearl Lusta, Perfume, and Mauve',
    isDark: false,
    colors: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F9FBC3',
        tertiary: '#ECAAFB',
        accent: '#B4A2F6',
        surface: '#FFFFFF',
        overlay: 'rgba(255, 255, 255, 0.95)'
      },
      text: {
        primary: '#989997',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        accent: '#B4A2F6'
      },
      interactive: {
        primary: '#B4A2F6',
        primaryHover: '#9b7ff7',
        primaryActive: '#8b5cf6',
        secondary: '#ECAAFB',
        secondaryHover: '#e879f9',
        secondaryActive: '#d946ef'
      },
      status: {
        success: '#10b981',
        warning: '#FCE54D',
        error: '#ef4444',
        info: '#B4A2F6'
      }
    }
  },
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    description: 'Natural Aqua Forest, Saffron Mango, and Burnt Sienna',
    isDark: false,
    colors: {
      background: {
        primary: '#FDF6EF',
        secondary: '#fef3ec',
        tertiary: '#fed7aa',
        accent: '#74B27B',
        surface: '#ffffff',
        overlay: 'rgba(253, 246, 239, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#6b7280',
        accent: '#74B27B'
      },
      interactive: {
        primary: '#74B27B',
        primaryHover: '#059669',
        primaryActive: '#047857',
        secondary: '#FACF55',
        secondaryHover: '#f59e0b',
        secondaryActive: '#d97706'
      },
      status: {
        success: '#74B27B',
        warning: '#FACF55',
        error: '#E96950',
        info: '#3b82f6'
      }
    }
  },
  {
    id: 'global-fusion',
    name: 'Global Fusion',
    description: 'Diverse Link Water, Light Wisteria, and Viking blend',
    isDark: false,
    colors: {
      background: {
        primary: '#FFFFFF',
        secondary: '#D6E6F2',
        tertiary: '#C8ABE6',
        accent: '#6EB8E1',
        surface: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#6b7280',
        accent: '#6EB8E1'
      },
      interactive: {
        primary: '#6EB8E1',
        primaryHover: '#0891b2',
        primaryActive: '#0e7490',
        secondary: '#C8ABE6',
        secondaryHover: '#a855f7',
        secondaryActive: '#9333ea'
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6EB8E1'
      }
    }
  },
  {
    name: 'Whimsical Wonderland',
    description: 'Playful Amaranth, Royal Blue, and Conifer harmony',
    isDark: false,
    colors: {
      background: {
        primary: '#F6F6F6',
        secondary: '#ffffff',
        tertiary: '#f1f5f9',
        accent: '#ED4059',
        surface: '#ffffff',
        overlay: 'rgba(246, 246, 246, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#6b7280',
        accent: '#ED4059'
      },
      interactive: {
        primary: '#ED4059',
        primaryHover: '#dc2626',
        primaryActive: '#b91c1c',
        secondary: '#4D59E3',
        secondaryHover: '#4338ca',
        secondaryActive: '#3730a3'
      },
      status: {
        success: '#C6E354',
        warning: '#f59e0b',
        error: '#ED4059',
        info: '#4D59E3'
      }
    }
  },
  {
    name: 'Material Design',
    description: 'Clean Material Design principles with warm undertones',
    isDark: false,
    colors: {
      background: {
        primary: '#F6ECDD',
        secondary: '#F1BCB1',
        tertiary: '#F2AD48',
        accent: '#DB3B2F',
        surface: '#ffffff',
        overlay: 'rgba(246, 236, 221, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#6b7280',
        accent: '#DB3B2F'
      },
      interactive: {
        primary: '#DB3B2F',
        primaryHover: '#dc2626',
        primaryActive: '#b91c1c',
        secondary: '#F2AD48',
        secondaryHover: '#f59e0b',
        secondaryActive: '#d97706'
      },
      status: {
        success: '#059669',
        warning: '#F2AD48',
        error: '#DB3B2F',
        info: '#2563eb'
      }
    }
  },
  {
    name: 'Electric Energy',
    description: 'High-energy design with vibrant electric blues',
    isDark: false,
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#A5AAB3',
        accent: '#3D98B4',
        surface: '#ffffff',
        overlay: 'rgba(255, 255, 255, 0.95)'
      },
      text: {
        primary: '#1f2937',
        secondary: '#374151',
        tertiary: '#A5AAB3',
        accent: '#3D98B4'
      },
      interactive: {
        primary: '#3D98B4',
        primaryHover: '#0891b2',
        primaryActive: '#0e7490',
        secondary: '#A5AAB3',
        secondaryHover: '#64748b',
        secondaryActive: '#475569'
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3D98B4'
      }
    }
  }
]; 
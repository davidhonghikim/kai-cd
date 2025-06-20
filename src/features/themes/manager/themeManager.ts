import { 
  type CustomTheme, 
  type ThemeColorPalette, 
  type ThemeExportData, 
  type ThemeValidationResult,
  type ThemePreference,
  THEME_TEMPLATES 
} from '../types/theme';
import coreSecureDB from './database/core';

const THEME_STORAGE_KEY = 'custom-themes';
const ACTIVE_THEME_KEY = 'active-theme';
const THEME_VERSION = '1.0';

// Default color palettes - Updated with 2024-2025 modern color trends
const DEFAULT_DARK_PALETTE: ThemeColorPalette = {
  background: {
    primary: '#0f0f23',      // Deep indigo-black (avoiding pure black)
    secondary: '#1a1a2e',    // Rich dark blue-gray
    tertiary: '#2a2d47',     // Medium blue-purple
    accent: '#4ecdc4',       // Modern teal accent
    surface: '#1e1e3f',      // Slightly lighter surface
    overlay: 'rgba(15, 15, 35, 0.95)'
  },
  text: {
    primary: '#f8fafc',      // Soft white (not pure white)
    secondary: '#cbd5e1',    // Light gray-blue
    tertiary: '#94a3b8',     // Medium gray-blue
    disabled: '#64748b',     // Muted gray
    inverse: '#1a1a2e',      // Dark for light backgrounds
    accent: '#4ecdc4'        // Teal accent text
  },
  border: {
    primary: '#374151',      // Warm gray border
    secondary: '#4b5563',    // Lighter warm gray
    accent: '#4ecdc4',       // Teal accent border
    focus: '#6ee7b7'         // Bright green focus (accessibility)
  },
  status: {
    success: '#10b981',      // Emerald green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red coral
    info: '#06b6d4'          // Cyan info
  },
  interactive: {
    primary: '#4ecdc4',      // Teal primary button
    primaryHover: '#3fb3b1', // Darker teal hover
    primaryActive: '#2d9490', // Even darker active
    secondary: '#8b5cf6',    // Purple secondary
    secondaryHover: '#7c3aed', // Purple hover
    secondaryActive: '#6d28d9' // Dark purple active
  },
  shadow: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.08)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.06)'
  }
};

const DEFAULT_LIGHT_PALETTE: ThemeColorPalette = {
  background: {
    primary: '#ffffff',      // Pure white
    secondary: '#f8fafc',    // Very light blue-gray
    tertiary: '#f1f5f9',     // Light blue-gray
    accent: '#0891b2',       // Professional teal accent
    surface: '#ffffff',      // Pure white surface
    overlay: 'rgba(248, 250, 252, 0.95)'
  },
  text: {
    primary: '#0f172a',      // Dark blue-gray (not pure black)
    secondary: '#475569',    // Medium dark blue-gray
    tertiary: '#64748b',     // Medium gray-blue
    disabled: '#94a3b8',     // Light gray-blue
    inverse: '#ffffff',      // White for dark backgrounds
    accent: '#0891b2'        // Teal accent text
  },
  border: {
    primary: '#e2e8f0',      // Light gray border
    secondary: '#cbd5e1',    // Slightly darker light gray
    accent: '#0891b2',       // Teal accent border
    focus: '#059669'         // Green focus (accessibility)
  },
  status: {
    success: '#059669',      // Emerald green (darker for light theme)
    warning: '#d97706',      // Amber (darker)
    error: '#dc2626',        // Red (darker)
    info: '#0284c7'          // Blue (darker)
  },
  interactive: {
    primary: '#0891b2',      // Teal primary button
    primaryHover: '#0e7490', // Darker teal hover
    primaryActive: '#164e63', // Even darker active
    secondary: '#7c3aed',    // Purple secondary
    secondaryHover: '#6d28d9', // Purple hover
    secondaryActive: '#5b21b6' // Dark purple active
  },
  shadow: {
    small: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
};

class ThemeManager {
  private customThemes: CustomTheme[] = [];
  private activeTheme: ThemePreference = 'system';
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await coreSecureDB.initialize();
      
      // Load custom themes
      const savedThemes = await coreSecureDB.retrieve<CustomTheme[]>(THEME_STORAGE_KEY, false);
      this.customThemes = savedThemes || [];
      
      // Load active theme
      const savedActiveTheme = await coreSecureDB.retrieve<ThemePreference>(ACTIVE_THEME_KEY, false);
      this.activeTheme = savedActiveTheme || 'system';
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize theme manager:', error);
      this.customThemes = [];
      this.activeTheme = 'system';
      this.initialized = true;
    }
  }

  // Built-in themes
  getBuiltInThemes(): CustomTheme[] {
    return [
      {
        id: 'light',
        name: 'Light',
        description: 'Clean and minimal light theme',
        version: THEME_VERSION,
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        colors: DEFAULT_LIGHT_PALETTE,
        isBuiltIn: true,
        isDark: false
      },
      {
        id: 'dark',
        name: 'Dark',
        description: 'Modern dark theme with blue accents',
        version: THEME_VERSION,
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        colors: DEFAULT_DARK_PALETTE,
        isBuiltIn: true,
        isDark: true
      }
    ];
  }

  getAllThemes(): CustomTheme[] {
    return [...this.getBuiltInThemes(), ...this.customThemes];
  }

  getTheme(id: string): CustomTheme | null {
    return this.getAllThemes().find(theme => theme.id === id) || null;
  }

  getCurrentTheme(): CustomTheme {
    if (this.activeTheme === 'system') {
      const prefersDark = typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        : false;
      return this.getTheme(prefersDark ? 'dark' : 'light')!;
    }
    
    return this.getTheme(this.activeTheme) || this.getTheme('dark')!;
  }

  getActiveThemeId(): ThemePreference {
    return this.activeTheme;
  }

  async setActiveTheme(themeId: ThemePreference): Promise<void> {
    this.activeTheme = themeId;
    await coreSecureDB.store(ACTIVE_THEME_KEY, themeId, { encrypt: false });
    this.applyTheme();
  }

  createTheme(
    name: string, 
    colors: ThemeColorPalette, 
    options: {
      description?: string;
      author?: string;
      isDark?: boolean;
      tags?: string[];
    } = {}
  ): CustomTheme {
    const theme: CustomTheme = {
      id: crypto.randomUUID(),
      name,
      description: options.description,
      author: options.author,
      version: THEME_VERSION,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      colors,
      tags: options.tags,
      isBuiltIn: false,
      isDark: options.isDark ?? this.detectDarkTheme(colors)
    };

    return theme;
  }

  async saveTheme(theme: CustomTheme): Promise<void> {
    const existingIndex = this.customThemes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      theme.modified = new Date().toISOString();
      this.customThemes[existingIndex] = theme;
    } else {
      this.customThemes.push(theme);
    }
    
    await coreSecureDB.store(THEME_STORAGE_KEY, this.customThemes, { encrypt: false });
  }

  async deleteTheme(themeId: string): Promise<boolean> {
    if (this.getBuiltInThemes().some(t => t.id === themeId)) {
      throw new Error('Cannot delete built-in themes');
    }

    const initialLength = this.customThemes.length;
    this.customThemes = this.customThemes.filter(t => t.id !== themeId);
    
    if (this.customThemes.length !== initialLength) {
      await coreSecureDB.store(THEME_STORAGE_KEY, this.customThemes, { encrypt: false });
      
      // If the deleted theme was active, switch to default
      if (this.activeTheme === themeId) {
        await this.setActiveTheme('system');
      }
      
      return true;
    }
    
    return false;
  }

  createFromTemplate(templateName: string, customName: string): CustomTheme | null {
    const template = THEME_TEMPLATES.find(t => t.name === templateName);
    if (!template) return null;

    const fullColors = this.mergeWithDefaults(
      template.colors, 
      template.isDark ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE
    );

    return this.createTheme(customName, fullColors, {
      description: `Based on ${template.description}`,
      isDark: template.isDark,
      tags: ['generated', 'template']
    });
  }

  validateTheme(theme: Partial<CustomTheme>): ThemeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!theme.name?.trim()) {
      errors.push('Theme name is required');
    }
    if (!theme.colors) {
      errors.push('Theme colors are required');
    }

    // Color validation
    if (theme.colors) {
      const requiredColorKeys = [
        'background.primary',
        'background.secondary', 
        'text.primary',
        'text.secondary',
        'interactive.primary'
      ];

      requiredColorKeys.forEach(keyPath => {
        const keys = keyPath.split('.');
        let obj: any = theme.colors;
        for (const key of keys) {
          obj = obj?.[key];
        }
        if (!obj) {
          errors.push(`Missing required color: ${keyPath}`);
        } else if (!this.isValidColor(obj)) {
          errors.push(`Invalid color format for ${keyPath}: ${obj}`);
        }
      });
    }

    // Warnings
    if (theme.name && theme.name.length > 50) {
      warnings.push('Theme name is quite long');
    }
    if (!theme.description) {
      warnings.push('Consider adding a description');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async exportThemes(themeIds?: string[]): Promise<string> {
    const themesToExport = themeIds 
      ? this.customThemes.filter(t => themeIds.includes(t.id))
      : this.customThemes;

    const exportData: ThemeExportData = {
      version: THEME_VERSION,
      exportDate: new Date().toISOString(),
      themes: themesToExport,
      metadata: {
        source: 'kai-cd',
        description: `Exported ${themesToExport.length} custom theme(s)`
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importThemes(jsonData: string): Promise<{ success: number; errors: string[] }> {
    try {
      const importData: ThemeExportData = JSON.parse(jsonData);
      
      if (!importData.themes || !Array.isArray(importData.themes)) {
        throw new Error('Invalid theme export format');
      }

      const results = { success: 0, errors: [] as string[] };

      for (const theme of importData.themes) {
        try {
          // Validate theme
          const validation = this.validateTheme(theme);
          if (!validation.isValid) {
            results.errors.push(`Theme "${theme.name}": ${validation.errors.join(', ')}`);
            continue;
          }

          // Generate new ID to avoid conflicts
          const newTheme: CustomTheme = {
            ...theme,
            id: crypto.randomUUID(),
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            isBuiltIn: false
          };

          await this.saveTheme(newTheme);
          results.success++;
        } catch (error) {
          results.errors.push(`Theme "${theme.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to import themes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Apply current theme to DOM
  applyTheme(): void {
    if (typeof document === 'undefined') return;

    const theme = this.getCurrentTheme();
    const root = document.documentElement;

    // Apply color variables
    this.applyColorPalette(root, theme.colors);
    
    // Set color scheme
    root.style.colorScheme = theme.isDark ? 'dark' : 'light';
    
    // Apply custom properties if defined
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
    }
    
    if (theme.typography) {
      // Apply typography variables
      Object.entries(theme.typography.fontSize || {}).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
    }
  }

  private applyColorPalette(root: HTMLElement, colors: ThemeColorPalette): void {
    // Apply background colors
    Object.entries(colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-bg-${key}`, value);
    });
    
    // Apply text colors
    Object.entries(colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    // Apply border colors
    Object.entries(colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
    
    // Apply status colors
    Object.entries(colors.status).forEach(([key, value]) => {
      root.style.setProperty(`--color-status-${key}`, value);
    });
    
    // Apply interactive colors
    Object.entries(colors.interactive).forEach(([key, value]) => {
      root.style.setProperty(`--color-interactive-${key}`, value);
    });
    
    // Apply shadows
    Object.entries(colors.shadow).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }

  private detectDarkTheme(colors: ThemeColorPalette): boolean {
    // Simple brightness detection
    const bgColor = colors.background.primary;
    const rgb = this.hexToRgb(bgColor);
    if (!rgb) return true; // Default to dark if can't parse
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness < 128;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private isValidColor(color: string): boolean {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true;
    
    // Check rgb/rgba
    if (/^rgba?\(/.test(color)) return true;
    
    // Check hsl/hsla
    if (/^hsla?\(/.test(color)) return true;
    
    // Check CSS color names (basic check)
    const colorNames = ['transparent', 'currentColor', 'inherit', 'initial', 'unset'];
    if (colorNames.includes(color)) return true;
    
    return false;
  }

  private mergeWithDefaults(partial: Partial<ThemeColorPalette>, defaults: ThemeColorPalette): ThemeColorPalette {
    return {
      background: { ...defaults.background, ...partial.background },
      text: { ...defaults.text, ...partial.text },
      border: { ...defaults.border, ...partial.border },
      status: { ...defaults.status, ...partial.status },
      interactive: { ...defaults.interactive, ...partial.interactive },
      shadow: { ...defaults.shadow, ...partial.shadow }
    };
  }
}

export const themeManager = new ThemeManager();
export default themeManager; 
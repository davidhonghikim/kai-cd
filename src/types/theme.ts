export interface ThemeColorPalette {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    surface: string;
    overlay: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    accent: string;
  };
  
  // UI element colors
  border: {
    primary: string;
    secondary: string;
    accent: string;
    focus: string;
  };
  
  // State colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Interactive elements
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
  };
  
  // Shadow and effects
  shadow: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version: string;
  created: string;
  modified: string;
  
  // Theme properties
  colors: ThemeColorPalette;
  spacing?: Partial<ThemeSpacing>;
  typography?: Partial<ThemeTypography>;
  borderRadius?: Partial<ThemeBorderRadius>;
  
  // Metadata
  tags?: string[];
  isBuiltIn: boolean;
  isDark: boolean;
  
  // Preview image data URL (optional)
  preview?: string;
}

// ThemePreset moved to themes/types.ts to avoid circular dependency
export type { ThemePreset } from './themes/types';

export type ThemePreference = 'light' | 'dark' | 'system' | string; // string for custom theme IDs

export interface ThemeExportData {
  version: string;
  exportDate: string;
  themes: CustomTheme[];
  metadata?: {
    source: string;
    description?: string;
  };
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Import theme templates from separate modules
export { THEME_TEMPLATES } from './themes/index'; 
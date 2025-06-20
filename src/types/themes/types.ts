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

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: Partial<ThemeColorPalette>;
  isDark: boolean;
} 
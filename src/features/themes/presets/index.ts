import { ThemePreset } from '../theme';
import { LIGHT_THEMES } from './lightThemes';
import { DARK_THEMES } from './darkThemes';
import { DEVELOPER_THEMES } from './developerThemes';

// Combine all theme collections
export const THEME_TEMPLATES: ThemePreset[] = [
  ...DEVELOPER_THEMES,
  ...LIGHT_THEMES,
  ...DARK_THEMES,
]; 
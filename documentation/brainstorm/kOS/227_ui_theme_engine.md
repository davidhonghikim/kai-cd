# 227_UI_Theme_Engine

## Overview
The UI Theme Engine is responsible for the consistent rendering of UI/UX styles across all user-facing applications under the kOS and kAI ecosystem. It provides real-time theming, accessibility configurations, support for dark/light modes, localization support, and dynamic branding based on user, organization, or deployment environment.

## Directory Structure
```txt
/ui-theme-engine
├── core
│   ├── ThemeContext.tsx
│   ├── ThemeProvider.tsx
│   ├── useTheme.ts
│   ├── ThemeManager.ts
│   └── types.ts
├── themes
│   ├── default.json
│   ├── dark.json
│   ├── high-contrast.json
│   └── corporate/
│       ├── acme.json
│       ├── retro.json
├── presets
│   ├── accessible.ts
│   ├── gamer.ts
│   └── executive.ts
├── utils
│   ├── colorUtils.ts
│   ├── validateTheme.ts
│   └── responsive.ts
├── tailwind
│   ├── tailwind.config.js
│   └── tailwind.preset.ts
├── assets
│   ├── fonts
│   ├── logos
│   └── illustrations
└── index.ts
```

## Theme Context & Provider
### `ThemeContext.tsx`
```tsx
import React from 'react';
export const ThemeContext = React.createContext(null);
```

### `ThemeProvider.tsx`
Wraps the entire UI in a theme and allows switching.
```tsx
import { ThemeContext } from './ThemeContext';
import { useState, useEffect } from 'react';
import { loadThemeFromStorage } from '../utils/colorUtils';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadThemeFromStorage() || 'default');
  useEffect(() => document.documentElement.setAttribute('data-theme', theme), [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
export default ThemeProvider;
```

### `useTheme.ts`
```ts
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
export const useTheme = () => useContext(ThemeContext);
```

## Theme Manager
Supports multiple levels of theme control:
- User Preferences
- System Settings
- Admin-enforced Corporate Branding
- Environment Defaults

### `ThemeManager.ts`
```ts
export const applyTheme = (themeName: string) => {
  localStorage.setItem('theme', themeName);
  document.documentElement.setAttribute('data-theme', themeName);
};

export const getTheme = (): string => localStorage.getItem('theme') || 'default';
```

## Tailwind Integration
### `tailwind.config.js`
```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: require('./tailwind.preset').colors,
      fontFamily: require('./tailwind.preset').fontFamily,
    },
  },
  plugins: [],
};
```

### `tailwind.preset.ts`
```ts
export const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  danger: '#dc3545',
  background: '#f8f9fa',
};

export const fontFamily = {
  sans: ['Inter', 'system-ui'],
  mono: ['Fira Code', 'monospace'],
};
```

## Accessibility Presets
```ts
export const accessible = {
  contrast: 'high',
  fontSize: 'larger',
  motion: 'reduced',
};
```

## Dynamic Branding Engine
- Injects organization-specific logos, color schemes, and layouts
- Works with remote config fetched from `/branding.json`
- Falls back to default theme if no config found

## Features
- Dark/Light/Auto (OS-based) Mode
- Animations toggle
- Font scaling
- Dynamic UI component theming
- UI Themes as importable JSON modules

## Security & Isolation
- Sandbox rendering of theme previews
- Validation of imported JSON themes via `validateTheme.ts`
- All configs stored and read-only unless admin flag is enabled

## Future Features
- Theme marketplace with previews
- Blockchain-based theme ownership (NFT-based UI skins)
- Peer-to-peer theme sharing via kLink

---
### Changelog
- 2025-06-20: Initial version


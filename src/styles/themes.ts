export interface Theme {
  name: string;
  colors: {
    [key: string]: string;
  };
}

const lightColors = {
  '--background-primary': '255 255 255', // #ffffff
  '--background-secondary': '242 242 247', // #f2f2f7
  '--background-tertiary': '229 229 234', // #e5e5ea
  '--text-primary': '0 0 0', // #000000
  '--text-secondary': '60 60 67', // #3c3c43
  '--text-placeholder': '142 142 147', // #8e8e93
  '--accent-primary': '0 122 255', // #007aff
  '--accent-primary-state': '0 102 215',
  '--border-primary': '209 209 214', // #d1d1d6
  '--red': '255 59 48', // #ff3b30
  '--green': '52 199 89', // #34c759
  '--blue': '0 122 255', // #007aff
  '--yellow': '255 204 0', // #ffcc00
};

const darkColors = {
  '--background-primary': '18 18 18', // #121212
  '--background-secondary': '28 28 30', // #1c1c1e
  '--background-tertiary': '44 44 46', // #2c2c2e
  '--text-primary': '255 255 255', // #ffffff
  '--text-secondary': '152 152 157', // #98989d
  '--text-placeholder': '99 99 102', // #636366
  '--accent-primary': '10 132 255', // #0a84ff
  '--accent-primary-state': '40 152 255',
  '--border-primary': '58 58 60', // #3a3a3c
  '--red': '255 69 58', // #ff453a
  '--green': '48 209 88', // #30d158
  '--blue': '10 132 255', // #0a84ff
  '--yellow': '255 214 10', // #ffd60a
};

export const lightTheme: Theme = {
  name: 'light',
  colors: lightColors,
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: darkColors,
};

export type ThemePreference = 'light' | 'dark' | 'system';

export const applyTheme = (preference: ThemePreference) => {
  let theme = darkTheme; // Default to dark
  if (preference === 'light') {
    theme = lightTheme;
  }
  if (preference === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = systemPrefersDark ? darkTheme : lightTheme;
  }

  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.style.colorScheme = theme.name;
}; 
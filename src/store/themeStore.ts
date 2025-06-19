import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ThemePreference, applyTheme } from '../styles/themes';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  _hasHydrated: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system', // Default theme
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        applyTheme(newTheme);
      },
      _hasHydrated: false,
    }),
    {
      name: 'kai-cd-theme-storage', // Key for localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          applyTheme(state.theme);

          // Also, add a listener for system theme changes
          window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
              if (useThemeStore.getState().theme === 'system') {
                applyTheme('system');
              }
            });
        }
      },
    }
  )
);

// Initialize the theme on load for the first time
useThemeStore.getState().setTheme(useThemeStore.getState().theme); 
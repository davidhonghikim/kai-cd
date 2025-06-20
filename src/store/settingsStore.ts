console.log('[SETTINGS_STORE] Starting settingsStore module initialization...');

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { chromeStorage } from './chromeStorage';
import { type ThemePreference } from '../types/theme';

console.log('[SETTINGS_STORE] All imports completed successfully');

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface SettingsState {
  logLevel: LogLevel;
  setLogLevel: (level: LogLevel) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  _hasHydrated: boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, _get) => ({
      theme: 'system',
      logLevel: 'DEBUG',
      _hasHydrated: false,
      setLogLevel: (level) => set({ logLevel: level }),
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        // Theme application is now handled by ThemeProvider and themeManager
      },
    }),
    {
      name: 'kai-cd-settings-storage',
      storage: createJSONStorage(() => chromeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          // Theme application is now handled by ThemeProvider
        }
      },
    },
  ),
);

// Initialize the theme on load for the first time
useSettingsStore.getState().setTheme(useSettingsStore.getState().theme); 
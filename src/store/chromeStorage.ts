import type { StateStorage } from 'zustand/middleware';

export const chromeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
    const result = await chrome.storage.local.get(name);
    return result[name] || null;
    } catch (error) {
      console.error(`Failed to get storage item "${name}":`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
    await chrome.storage.local.set({ [name]: value });
    } catch (error) {
      console.error(`Failed to set storage item "${name}":`, error);
      // Check if it's a quota error
      if (error instanceof Error && error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Storage quota exceeded. Please free up space.');
      }
      throw error;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
    await chrome.storage.local.remove(name);
    } catch (error) {
      console.error(`Failed to remove storage item "${name}":`, error);
      throw error;
    }
  },
}; 
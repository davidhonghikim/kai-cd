/**
 * A wrapper for the chrome.storage.local API, implemented as a singleton class.
 */
export const storageManager = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? defaultValue;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return defaultValue;
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Error setting storage:', error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}; 
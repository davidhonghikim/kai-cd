/**
 * A wrapper for the chrome.storage.local API, implemented as a singleton class.
 */
class StorageManager {
  /**
   * Retrieves an item from storage.
   * @param key The key of the item to retrieve.
   * @returns The retrieved item or undefined if not found.
   */
  public get<T>(key: string): Promise<T | undefined>;
  /**
   * Retrieves an item from storage.
   * @param key The key of the item to retrieve.
   * @param defaultValue The default value to return if the key is not found.
   * @returns The retrieved item or the default value.
   */
  public get<T>(key: string, defaultValue: T): Promise<T>;
  public async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        try {
          const value = result?.[key];
          if (value === undefined || value === null) {
            resolve(defaultValue);
          } else {
            resolve(value as T);
          }
        } catch (error) {
          console.error(`Error getting value for key ${key}:`, error);
          resolve(defaultValue);
        }
      });
    });
  }

  /**
   * Sets an item in storage.
   * @param key The key of the item to set.
   * @param value The value to set.
   */
  public async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * Removes an item from storage.
   * @param key The key of the item to remove.
   */
  public async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  }
}

export const storageManager = new StorageManager();
 
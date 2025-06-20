import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { encryptData, decryptData, generateEncryptionKey, deriveKeyFromPassword } from '../crypto';

// Database schema
export interface SecurityDBSchema extends DBSchema {
  securityState: {
    key: string;
    value: {
      id: string;
      encryptedData: string;
      iv: string;
      timestamp: number;
      expiresAt?: number;
    };
  };
  settings: {
    key: string;
    value: {
      id: string;
      value: any;
      timestamp: number;
    };
  };
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  expiration?: number; // Minutes
}

class CoreSecureDB {
  private db: IDBPDatabase<SecurityDBSchema> | null = null;
  private sessionKey: CryptoKey | null = null;
  private isInitialized = false;

  async initialize(masterPassword?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<SecurityDBSchema>('kai-security-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('securityState')) {
            const securityStore = db.createObjectStore('securityState', { keyPath: 'id' });
            securityStore.createIndex('timestamp', 'timestamp');
            securityStore.createIndex('expiresAt', 'expiresAt');
          }

          if (!db.objectStoreNames.contains('settings')) {
            const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
            settingsStore.createIndex('timestamp', 'timestamp');
          }
        }
      });

      // Initialize session key
      if (masterPassword) {
        this.sessionKey = await deriveKeyFromPassword(masterPassword);
      } else {
        this.sessionKey = await generateEncryptionKey();
      }

      this.isInitialized = true;
      await this.cleanExpiredData();
      
    } catch (error) {
      console.error('Failed to initialize secure database:', error);
      throw new Error('Database initialization failed');
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db || !this.sessionKey) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  async store<T>(key: string, data: T, options: SecureStorageOptions = { encrypt: true }): Promise<void> {
    this.ensureInitialized();

    try {
      const serializedData = JSON.stringify(data);
      const timestamp = Date.now();
      const expiresAt = options.expiration ? timestamp + (options.expiration * 60 * 1000) : undefined;

      if (options.encrypt && this.sessionKey) {
        const { encryptedData, iv } = await encryptData(serializedData, this.sessionKey);
        
        await this.db!.put('securityState', {
          id: key,
          encryptedData,
          iv,
          timestamp,
          expiresAt
        });
      } else {
        await this.db!.put('settings', {
          id: key,
          value: data,
          timestamp
        });
      }
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      throw new Error(`Storage operation failed for key: ${key}`);
    }
  }

  async retrieve<T>(key: string, encrypted = true): Promise<T | null> {
    this.ensureInitialized();

    try {
      if (encrypted) {
        const record = await this.db!.get('securityState', key);
        if (!record) return null;

        // Check expiration
        if (record.expiresAt && Date.now() > record.expiresAt) {
          await this.delete(key);
          return null;
        }

        if (!this.sessionKey) {
          throw new Error('No session key available for decryption');
        }

        const decryptedData = await decryptData(record.encryptedData, record.iv, this.sessionKey);
        return JSON.parse(decryptedData);
      } else {
        const record = await this.db!.get('settings', key);
        return record ? record.value : null;
      }
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return null;
    }
  }

  async delete(key: string, encrypted = true): Promise<void> {
    this.ensureInitialized();

    try {
      if (encrypted) {
        await this.db!.delete('securityState', key);
      } else {
        await this.db!.delete('settings', key);
      }
    } catch (error) {
      console.error(`Failed to delete data for key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = this.db!.transaction(['securityState', 'settings'], 'readwrite');
      await Promise.all([
        tx.objectStore('securityState').clear(),
        tx.objectStore('settings').clear()
      ]);
      await tx.done;
    } catch (error) {
      console.error('Failed to clear database:', error);
    }
  }

  async cleanExpiredData(): Promise<void> {
    this.ensureInitialized();

    try {
      const now = Date.now();
      const tx = this.db!.transaction(['securityState'], 'readwrite');
      const securityStore = tx.objectStore('securityState');
      const securityIndex = securityStore.index('expiresAt');
      const expiredRecords = await securityIndex.getAll(IDBKeyRange.upperBound(now));
      
      for (const record of expiredRecords) {
        await securityStore.delete(record.id);
      }

      await tx.done;
    } catch (error) {
      console.error('Failed to clean expired data:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized && !!this.db && !!this.sessionKey;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.sessionKey = null;
      this.isInitialized = false;
    }
  }
}

export const coreSecureDB = new CoreSecureDB();
export default coreSecureDB; 
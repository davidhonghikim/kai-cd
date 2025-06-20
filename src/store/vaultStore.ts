import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { chromeStorage } from './chromeStorage';
import { encrypt, decrypt } from '../utils/crypto';
import type { Credential } from '../types';

export type VaultStatus = 'LOCKED' | 'UNLOCKED' | 'UNSET';
export type AutoLockTimeout = 1 | 5 | 15 | 30 | 60 | 120 | 240 | 480 | 1440 | 0 | -1; // Minutes: 1min, 5min, 15min, 30min, 1hr, 2hr, 4hr, 8hr, 24hr, never(0), browser-restart(-1)

interface VaultState {
  status: VaultStatus;
  masterPassword?: string;
  encryptedVault?: string;
  credentials: Credential[];
  // Auto-lock functionality
  autoLockTimeout: AutoLockTimeout;
  lastActivity: number;
  autoLockTimer?: number;
  
  setMasterPassword: (password: string) => void;
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
  addCredential: (credential: Omit<Credential, 'id'>) => void;
  updateCredential: (id: string, credential: Partial<Omit<Credential, 'id'>>) => void;
  deleteCredential: (id: string) => void;
  
  // Auto-lock methods
  setAutoLockTimeout: (timeout: AutoLockTimeout) => void;
  updateActivity: () => void;
  startAutoLockTimer: () => void;
  stopAutoLockTimer: () => void;
  getRemainingTime: () => number; // Returns seconds until auto-lock
}

const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => {
      const reEncryptVault = () => {
        const { credentials, masterPassword } = get();
        if (!masterPassword) throw new Error('Cannot re-encrypt vault without master password.');
        const encrypted = encrypt(JSON.stringify({ credentials }), masterPassword);
        set({ encryptedVault: encrypted });
      };

      const startAutoLockTimer = () => {
        const state = get();
        // Clear existing timer
        if (state.autoLockTimer) {
          clearTimeout(state.autoLockTimer);
        }
        
        // Don't start timer if disabled, browser-restart mode, or vault not unlocked
        if (state.autoLockTimeout === 0 || state.autoLockTimeout === -1 || state.status !== 'UNLOCKED') {
          return;
        }
        
        const timeoutMs = state.autoLockTimeout * 60 * 1000; // Convert minutes to milliseconds
        const timer = setTimeout(() => {
          const currentState = get();
          if (currentState.status === 'UNLOCKED') {
            currentState.lock();
          }
        }, timeoutMs);
        
        set({ autoLockTimer: timer });
      };

      return {
        status: 'UNSET',
        credentials: [],
        autoLockTimeout: 15, // Default to 15 minutes
        lastActivity: Date.now(),

        setMasterPassword: (password: string) => {
          const encrypted = encrypt(JSON.stringify({ credentials: [] }), password);
          set({
            masterPassword: password,
            status: 'UNLOCKED',
            encryptedVault: encrypted,
            credentials: [],
            lastActivity: Date.now(),
          });
          get().startAutoLockTimer();
        },

        changeMasterPassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
          const { encryptedVault, credentials } = get();
          
          // First verify the current password
          if (!encryptedVault) {
            return false;
          }

          try {
            // Try to decrypt with current password
            const decrypted = decrypt(encryptedVault, currentPassword);
            const vaultData = JSON.parse(decrypted);
            
            // Re-encrypt with new password
            const newEncrypted = encrypt(JSON.stringify({ credentials: vaultData.credentials || credentials }), newPassword);
            
            set({
              masterPassword: newPassword,
              encryptedVault: newEncrypted,
              lastActivity: Date.now(),
            });
            
            get().startAutoLockTimer(); // Reset timer on password change
            return true;
          } catch (error) {
            console.error('Failed to change master password:', error);
            return false;
          }
        },

        lock: () => {
          const { autoLockTimer } = get();
          if (autoLockTimer) {
            clearTimeout(autoLockTimer);
          }
          set({ 
            status: 'LOCKED', 
            masterPassword: undefined, 
            credentials: [],
            autoLockTimer: undefined
          });
        },

        unlock: async (password: string): Promise<boolean> => {
          const { encryptedVault } = get();
          if (!encryptedVault) {
            // This is a new vault setup
            set({ status: 'UNSET' });
            return false;
          }

          try {
            const decrypted = decrypt(encryptedVault, password);
            const vaultData = JSON.parse(decrypted);
            set({ 
              status: 'UNLOCKED', 
              masterPassword: password, 
              credentials: vaultData.credentials || [],
              lastActivity: Date.now()
            });
            get().startAutoLockTimer();
            return true;
          } catch (error) {
            console.error('Failed to unlock vault:', error);
            return false;
          }
        },

        addCredential: (credential: Omit<Credential, 'id'>) => {
          set((state) => ({
            credentials: [...state.credentials, { ...credential, id: uuidv4() }],
            lastActivity: Date.now(),
          }));
          reEncryptVault();
          get().startAutoLockTimer(); // Reset timer on activity
        },

        updateCredential: (id: string, credentialUpdate: Partial<Omit<Credential, 'id'>>) => {
          set((state) => ({
            credentials: state.credentials.map((c) =>
              c.id === id ? { ...c, ...credentialUpdate } : c
            ),
            lastActivity: Date.now(),
          }));
          reEncryptVault();
          get().startAutoLockTimer(); // Reset timer on activity
        },

        deleteCredential: (id: string) => {
          set((state) => ({
            credentials: state.credentials.filter((c) => c.id !== id),
            lastActivity: Date.now(),
          }));
          reEncryptVault();
          get().startAutoLockTimer(); // Reset timer on activity
        },

        setAutoLockTimeout: (timeout: AutoLockTimeout) => {
          set({ autoLockTimeout: timeout });
          // Restart timer with new timeout
          if (get().status === 'UNLOCKED') {
            get().startAutoLockTimer();
          }
        },

        updateActivity: () => {
          set({ lastActivity: Date.now() });
          // Reset auto-lock timer on activity
          if (get().status === 'UNLOCKED') {
            get().startAutoLockTimer();
          }
        },

        startAutoLockTimer,

        stopAutoLockTimer: () => {
          const { autoLockTimer } = get();
          if (autoLockTimer) {
            clearTimeout(autoLockTimer);
            set({ autoLockTimer: undefined });
          }
        },

        getRemainingTime: () => {
          const { lastActivity, autoLockTimeout, status } = get();
          if (status !== 'UNLOCKED' || autoLockTimeout === 0 || autoLockTimeout === -1) {
            return 0;
          }
          const elapsed = Date.now() - lastActivity;
          const totalTimeout = autoLockTimeout * 60 * 1000;
          const remaining = Math.max(0, totalTimeout - elapsed);
          return Math.floor(remaining / 1000); // Return seconds
        },
      };
    },
    {
      name: 'kai-vault-storage',
      storage: createJSONStorage(() => chromeStorage),
      partialize: (state) => ({
        encryptedVault: state.encryptedVault,
        status: state.status === 'UNSET' ? 'UNSET' : 'LOCKED',
        autoLockTimeout: state.autoLockTimeout,
      }),
    }
  )
);

export default useVaultStore; 
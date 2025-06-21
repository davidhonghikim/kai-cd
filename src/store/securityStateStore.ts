import { create } from 'zustand';
import securityStateAdapter, { type SecurityStateTimeout, type SecurityState } from '../utils/database/securityStateAdapter';
import type { DicewareResult, DicewareOptions } from '../utils/diceware';
import type { PasswordAnalysis } from '../utils/passwordSecurity';

// Re-export types for convenience
export type { SecurityStateTimeout, SecurityState };

interface SecurityStateActions {
  // Core actions using encrypted database
  initialize: (masterPassword?: string) => Promise<void>;
  getState: () => SecurityState;
  updateState: (updates: Partial<SecurityState>, toolName?: string) => Promise<void>;
  
  // Convenience methods for components
  setGeneratedPassword: (password: string, result?: DicewareResult | null) => Promise<void>;
  setCustomDicewareOptions: (options: DicewareOptions) => Promise<void>;
  setAnalyzedPassword: (password: string, result?: PasswordAnalysis | null) => Promise<void>;
  setSelectedSecurityLevel: (level: string) => Promise<void>;
  setStateTimeout: (timeout: SecurityStateTimeout) => Promise<void>;
  clearAllState: () => Promise<void>;
  
  // State checks
  isReady: () => boolean;
  updateActivity: () => Promise<void>;
}

type SecurityStoreState = SecurityState & SecurityStateActions;

const useSecurityStateStore = create<SecurityStoreState>((set, get) => ({
  // Proxy the state from the adapter
  ...securityStateAdapter.getState(),

  // Actions using encrypted database
  initialize: async (masterPassword?: string) => {
    await securityStateAdapter.initialize(masterPassword);
    // Sync local state with adapter state
    set(securityStateAdapter.getState());
  },

  getState: () => securityStateAdapter.getState(),

  updateState: async (updates: Partial<SecurityState>, toolName?: string) => {
    await securityStateAdapter.updateState(updates, toolName);
    // Sync local state
    set(securityStateAdapter.getState());
  },

  // Convenience methods
  setGeneratedPassword: async (password: string, result?: DicewareResult | null) => {
    await get().updateState({ 
      generatedPassword: password, 
      dicewareResult: result || null 
    }, 'passwordGenerator');
    // Force state sync after update
    set(securityStateAdapter.getState());
  },

  setCustomDicewareOptions: async (options: DicewareOptions) => {
    await get().updateState({ customDicewareOptions: options });
    // Force state sync after update
    set(securityStateAdapter.getState());
  },

  setAnalyzedPassword: async (password: string, result?: PasswordAnalysis | null) => {
    await get().updateState({ 
      analyzedPassword: password, 
      analysisResult: result || null 
    }, 'passwordAnalyzer');
    // Force state sync after update
    set(securityStateAdapter.getState());
  },

  setSelectedSecurityLevel: async (level: string) => {
    await get().updateState({ selectedSecurityLevel: level });
  },

  setStateTimeout: async (timeout: SecurityStateTimeout) => {
    await securityStateAdapter.setStateTimeout(timeout);
    set(securityStateAdapter.getState());
  },

  clearAllState: async () => {
    await securityStateAdapter.clearAllState();
    set(securityStateAdapter.getState());
  },

  isReady: () => securityStateAdapter.isReady(),

  updateActivity: async () => {
    await get().updateState({ lastActivity: Date.now() });
  }
}));

export default useSecurityStateStore; 
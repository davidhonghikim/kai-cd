import coreSecureDB from './core';
import type { DicewareResult, DicewareOptions } from '../diceware';
import type { PasswordAnalysis } from '../passwordSecurity';

export type SecurityStateTimeout = 5 | 10 | 15 | 30 | 60 | 120 | 0;

// Security state interfaces
export interface SecurityState {
  generatedPassword: string;
  dicewareResult: DicewareResult | null;
  customDicewareOptions: DicewareOptions;
  analyzedPassword: string;
  analysisResult: PasswordAnalysis | null;
  selectedSecurityLevel: string;
  hashInput: string;
  generatedHashes: { [algorithm: string]: string };
  encodingInput: string;
  encodingResults: { base64: string; hex: string; url: string };
  pgpKeySize: number;
  lastPgpKeys: { publicKey: string; privateKey: string } | null;
  sshKeyType: 'ed25519' | 'rsa';
  sshKeySize: number;
  sshComment: string;
  lastSshKeys: { publicKey: string; privateKey: string } | null;
  stateTimeout: SecurityStateTimeout;
  lastActivity: number;
}

const DEFAULT_STATE: SecurityState = {
  generatedPassword: '',
  dicewareResult: null,
  customDicewareOptions: {
    wordlist: 'eff_short_2',
    wordCount: 5,
    separator: 'space',
    customSeparator: '',
    capitalization: 'none',
    numbers: 'none',
    numberCount: 2
  },
  analyzedPassword: '',
  analysisResult: null,
  selectedSecurityLevel: 'standard',
  hashInput: '',
  generatedHashes: {},
  encodingInput: '',
  encodingResults: { base64: '', hex: '', url: '' },
  pgpKeySize: 2048,
  lastPgpKeys: null,
  sshKeyType: 'ed25519',
  sshKeySize: 2048,
  sshComment: '',
  lastSshKeys: null,
  stateTimeout: 15,
  lastActivity: Date.now()
};

class SecurityStateAdapter {
  private currentState: SecurityState = { ...DEFAULT_STATE };
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async initialize(masterPassword?: string): Promise<void> {
    await coreSecureDB.initialize(masterPassword);
    await this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      const savedState = await coreSecureDB.retrieve<SecurityState>('securityState');
      if (savedState) {
        this.currentState = { ...DEFAULT_STATE, ...savedState };
        this.restartTimers();
      }
    } catch (error) {
      console.error('Failed to load security state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      const timeout = this.currentState.stateTimeout === 0 ? undefined : this.currentState.stateTimeout;
      await coreSecureDB.store('securityState', this.currentState, {
        encrypt: true,
        expiration: timeout
      });
    } catch (error) {
      console.error('Failed to save security state:', error);
    }
  }

  private startTimer(toolName: string): void {
    const { stateTimeout } = this.currentState;
    if (stateTimeout === 0) return;

    this.clearTimer(toolName);
    
    const timer = setTimeout(() => {
      this.clearToolState(toolName);
      this.timers.delete(toolName);
    }, stateTimeout * 60 * 1000);
    
    this.timers.set(toolName, timer);
  }

  private clearTimer(toolName: string): void {
    const timer = this.timers.get(toolName);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(toolName);
    }
  }

  private clearToolState(toolName: string): void {
    switch (toolName) {
      case 'passwordGenerator':
        this.currentState.generatedPassword = '';
        this.currentState.dicewareResult = null;
        break;
      case 'passwordAnalyzer':
        this.currentState.analyzedPassword = '';
        this.currentState.analysisResult = null;
        break;
      case 'hashGenerator':
        this.currentState.hashInput = '';
        this.currentState.generatedHashes = {};
        break;
      case 'encodingTools':
        this.currentState.encodingInput = '';
        this.currentState.encodingResults = { base64: '', hex: '', url: '' };
        break;
      case 'pgpKeys':
        this.currentState.lastPgpKeys = null;
        break;
      case 'sshKeys':
        this.currentState.lastSshKeys = null;
        break;
    }
    this.saveState();
  }

  private restartTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    if (this.currentState.stateTimeout > 0) {
      if (this.currentState.generatedPassword) this.startTimer('passwordGenerator');
      if (this.currentState.analyzedPassword) this.startTimer('passwordAnalyzer');
      if (this.currentState.hashInput) this.startTimer('hashGenerator');
      if (this.currentState.encodingInput) this.startTimer('encodingTools');
      if (this.currentState.lastPgpKeys) this.startTimer('pgpKeys');
      if (this.currentState.lastSshKeys) this.startTimer('sshKeys');
    }
  }

  // Public methods
  getState(): SecurityState {
    return { ...this.currentState };
  }

  async updateState(updates: Partial<SecurityState>, toolName?: string): Promise<void> {
    this.currentState = { ...this.currentState, ...updates, lastActivity: Date.now() };
    if (toolName) {
      this.startTimer(toolName);
    }
    await this.saveState();
  }

  async setStateTimeout(timeout: SecurityStateTimeout): Promise<void> {
    this.currentState.stateTimeout = timeout;
    this.restartTimers();
    await this.saveState();
  }

  async clearAllState(): Promise<void> {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.currentState = { ...DEFAULT_STATE };
    await coreSecureDB.delete('securityState');
  }

  isReady(): boolean {
    return coreSecureDB.isReady();
  }
}

export const securityStateAdapter = new SecurityStateAdapter();
export default securityStateAdapter; 
import type { 
  AppConfig, 
  UserConfig, 
  ConfigWithMetadata, 
  ConfigUpdateEvent,
  ConfigValidationResult,
  DeepPartial 
} from './types';
import { systemConfig, systemConfigMetadata } from './system';

/**
 * Configuration Manager
 * 
 * Centralized configuration management system that handles:
 * - Loading system and user configurations
 * - Merging configurations with proper precedence
 * - Validating configuration values
 * - Providing type-safe configuration access
 * - Broadcasting configuration changes
 */
class ConfigManager {
  private config: ConfigWithMetadata;
  private userConfig: UserConfig = {};
  private listeners: Set<(event: ConfigUpdateEvent) => void> = new Set();

  constructor() {
    this.config = {
      ...systemConfig,
      _metadata: systemConfigMetadata,
    };
  }

  /**
   * Initialize the configuration manager
   */
  async initialize(): Promise<void> {
    try {
      // Load user configuration from storage
      const userConfigData = await this.loadUserConfig();
      if (userConfigData) {
        this.userConfig = userConfigData;
        this.mergeConfigurations();
      }
    } catch (error) {
      console.warn('Failed to load user configuration:', error);
      // Continue with system defaults
    }
  }

  /**
   * Get the complete merged configuration
   */
  getConfig(): AppConfig {
    const { _metadata, ...config } = this.config;
    return config;
  }

  /**
   * Get a specific configuration value by path
   */
  get<T = any>(path: string): T {
    return this.getValueByPath(this.config, path);
  }

  /**
   * Set a configuration value
   */
  async set(path: string, value: any): Promise<void> {
    const oldValue = this.get(path);
    
    // Update user config
    this.setValueByPath(this.userConfig, path, value);
    
    // Merge and update main config
    this.mergeConfigurations();
    
    // Save user config
    await this.saveUserConfig();
    
    // Notify listeners
    this.notifyListeners({
      key: path,
      oldValue,
      newValue: value,
      source: 'user',
      timestamp: Date.now(),
    });
  }

  /**
   * Update multiple configuration values
   */
  async update(updates: DeepPartial<AppConfig>): Promise<void> {
    const oldConfig = { ...this.config };
    
    // Deep merge with user config
    this.userConfig = this.deepMerge(this.userConfig, updates);
    
    // Merge and update main config
    this.mergeConfigurations();
    
    // Save user config
    await this.saveUserConfig();
    
    // Notify listeners of the batch update
    this.notifyListeners({
      key: 'batch_update',
      oldValue: oldConfig,
      newValue: this.config,
      source: 'user',
      timestamp: Date.now(),
    });
  }

  /**
   * Reset configuration to system defaults
   */
  async reset(): Promise<void> {
    const oldConfig = { ...this.config };
    
    this.userConfig = {};
    this.config = {
      ...systemConfig,
      _metadata: {
        ...systemConfigMetadata,
        lastModified: Date.now(),
        source: 'system',
      },
    };
    
    await this.saveUserConfig();
    
    this.notifyListeners({
      key: 'reset',
      oldValue: oldConfig,
      newValue: this.config,
      source: 'system',
      timestamp: Date.now(),
    });
  }

  /**
   * Validate configuration
   */
  validate(config: Partial<AppConfig> = this.config): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate networking
    if (config.networking) {
      if (config.networking.defaultTimeoutMs && config.networking.defaultTimeoutMs < 1000) {
        errors.push('Network timeout must be at least 1000ms');
      }
    }

    // Validate security
    if (config.security) {
      if (config.security.defaultPasswordLength && config.security.defaultPasswordLength < 8) {
        errors.push('Default password length must be at least 8 characters');
      }
      if (config.security.autoLockTimeout && config.security.autoLockTimeout < 0) {
        errors.push('Auto-lock timeout cannot be negative');
      }
    }

    // Validate theme
    if (config.theme) {
      if (config.theme.themeTransitionDuration && config.theme.themeTransitionDuration < 0) {
        warnings.push('Theme transition duration should be positive');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (event: ConfigUpdateEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Export configuration for backup
   */
  export(): ConfigWithMetadata {
    return { ...this.config };
  }

  /**
   * Import configuration from backup
   */
  async import(config: Partial<AppConfig>): Promise<void> {
    const validation = this.validate(config);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    await this.update(config);
  }

  // Private methods

  private async loadUserConfig(): Promise<UserConfig | null> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('user-config');
      return result['user-config'] || null;
    }
    
    // Fallback to localStorage for development
    const stored = localStorage.getItem('kai-cd-user-config');
    return stored ? JSON.parse(stored) : null;
  }

  private async saveUserConfig(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ 'user-config': this.userConfig });
    } else {
      // Fallback to localStorage for development
      localStorage.setItem('kai-cd-user-config', JSON.stringify(this.userConfig));
    }
  }

  private mergeConfigurations(): void {
    const merged = this.deepMerge(systemConfig, this.userConfig);
    this.config = {
      ...merged,
      _metadata: {
        version: systemConfigMetadata.version,
        lastModified: Date.now(),
        source: 'merged',
      },
    };
  }

  private deepMerge<T extends Record<string, any>>(target: T, source: any): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private notifyListeners(event: ConfigUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Configuration listener error:', error);
      }
    });
  }
}

// Create and export the singleton instance
export const configManager = new ConfigManager();

// Export types and utilities
export type { AppConfig, UserConfig, ConfigUpdateEvent, ConfigValidationResult };
export { systemConfig };

// Export convenience functions
export const getConfig = () => configManager.getConfig();
export const getConfigValue = <T = any>(path: string): T => configManager.get<T>(path);
export const setConfigValue = (path: string, value: any) => configManager.set(path, value);
export const updateConfig = (updates: DeepPartial<AppConfig>) => configManager.update(updates); 
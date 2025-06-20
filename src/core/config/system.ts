import type { AppConfig } from './types';

/**
 * System Default Configuration
 * 
 * These are the baseline settings for the application.
 * User configurations will override these values.
 * 
 * ⚠️ Do not modify this file for local development.
 * Use user configuration overrides instead.
 */
export const systemConfig: AppConfig = {
  // Network configuration
  networking: {
    localIp: 'localhost',
    remoteIp: '', // Must be configured by user
    defaultTimeoutMs: 15000,
  },

  // Service default models and settings
  services: {
    defaultOllamaModel: 'gemma3:1b',
    defaultOpenAiModel: 'gpt-4o',
    defaultOpenWebUIModel: 'gemma:latest',
    defaultComfyUIModel: 'v1-5-pruned-emaonly.safetensors',
    defaultA1111Model: '',
    defaultA1111Refiner: '',
    defaultAnthropicModel: 'claude-3-haiku-20240307',
    defaultHuggingFaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    defaultHuggingFaceImageModel: 'stabilityai/stable-diffusion-2-1',
  },

  // User interface settings
  ui: {
    defaultTheme: 'dark',
    showCategoryHeaders: true,
  },

  // Developer and debugging settings
  developer: {
    logLevel: 'info',
    loadDefaultServices: true,
    featureFlags: {
      enableGraphExecutionUi: false,
    },
  },

  // Logging configuration
  logging: {
    enabled: true,
    level: 'info',
  },

  // Security settings
  security: {
    autoLockTimeout: 15, // 15 minutes default
    defaultPasswordLength: 16,
    encryptionAlgorithm: 'AES-GCM',
    hashIterations: 100000,
  },

  // Theme system settings
  theme: {
    customThemesEnabled: true,
    themeTransitionDuration: 200, // milliseconds
    defaultColorScheme: 'dark-mode-elite',
  },
};

/**
 * Configuration metadata for system config
 */
export const systemConfigMetadata = {
  version: '1.0.0',
  lastModified: Date.now(),
  source: 'system' as const,
}; 
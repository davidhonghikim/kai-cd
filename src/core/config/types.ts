/**
 * Configuration Type Definitions
 * 
 * Centralized type definitions for all application configuration.
 * This ensures type safety and consistency across the configuration system.
 */

export interface NetworkingConfig {
  localIp: string;
  remoteIp: string;
  defaultTimeoutMs: number;
}

export interface ServiceDefaultsConfig {
  defaultOllamaModel: string;
  defaultOpenAiModel: string;
  defaultOpenWebUIModel: string;
  defaultComfyUIModel: string;
  defaultA1111Model: string;
  defaultA1111Refiner: string;
  defaultAnthropicModel: string;
  defaultHuggingFaceModel: string;
  defaultHuggingFaceImageModel: string;
}

export interface UIConfig {
  defaultTheme: 'light' | 'dark' | 'system';
  showCategoryHeaders: boolean;
}

export interface DeveloperConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  loadDefaultServices: boolean;
  featureFlags: {
    enableGraphExecutionUi: boolean;
  };
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

export interface SecurityConfig {
  autoLockTimeout: number; // minutes
  defaultPasswordLength: number;
  encryptionAlgorithm: string;
  hashIterations: number;
}

export interface ThemeConfig {
  customThemesEnabled: boolean;
  themeTransitionDuration: number;
  defaultColorScheme: string;
}

/**
 * Complete application configuration interface
 */
export interface AppConfig {
  networking: NetworkingConfig;
  services: ServiceDefaultsConfig;
  ui: UIConfig;
  developer: DeveloperConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  theme: ThemeConfig;
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  version: string;
  lastModified: number;
  source: 'system' | 'user' | 'merged';
}

/**
 * Configuration with metadata
 */
export interface ConfigWithMetadata extends AppConfig {
  _metadata: ConfigMetadata;
}

/**
 * Configuration update event
 */
export interface ConfigUpdateEvent {
  key: string;
  oldValue: any;
  newValue: any;
  source: 'system' | 'user';
  timestamp: number;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Deep partial type for configuration updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * User configuration override type
 */
export type UserConfig = DeepPartial<AppConfig>; 
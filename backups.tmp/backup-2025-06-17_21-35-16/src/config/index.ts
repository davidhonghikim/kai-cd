export { 
  SERVICE_TYPES, 
  SERVICE_CATEGORIES, 
  SERVICE_TYPE_TO_CATEGORY,
  SERVICE_DISPLAY_NAMES,
  SERVICE_ICONS,
  HEALTH_CHECK_PATHS
} from './constants';
export * from './defaults';
export * from './endpoints';
export * from './services';
export * from './theme';
// Add any additional configuration exports here

// Configuration version (bump this when making breaking changes to the config structure)
export const CONFIG_VERSION = '1.0.0';

// Define types for the configuration
interface ServiceConfig {
  id: string;
  name: string;
  type: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
  // Add other service-specific properties as needed
}

interface ModelConfig {
  id: string;
  name: string;
  serviceId: string;
  // Add other model-specific properties as needed
}

interface ConversationConfig {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: number;
  }>;
  // Add other conversation-specific properties as needed
}

interface PromptConfig {
  id: string;
  name: string;
  content: string;
  // Add other prompt-specific properties as needed
}

// Default configuration values
export const DEFAULT_CONFIG = {
  version: CONFIG_VERSION,
  settings: {
    theme: 'system',
    language: 'en-US',
    fontSize: 14,
    lineHeight: 1.5,
    autoScroll: true,
    compactView: false,
    markdown: true,
    codeHighlighting: true,
    enableNotifications: true,
    soundEnabled: true,
    telemetry: false,
    errorReporting: false,
    autoBackup: true,
    backupInterval: 86400, // 24 hours in seconds
  },
  services: [] as ServiceConfig[],
  models: [] as ModelConfig[],
  conversations: [] as ConversationConfig[],
  prompts: [] as PromptConfig[],
  // Add any additional default configuration here
} as const;

// Configuration keys that should be persisted to storage
export const PERSISTED_KEYS = [
  'settings',
  'services',
  'models',
  'conversations',
  'prompts',
  // Add any additional keys that should be persisted
];

// Configuration keys that should be synced across devices
export const SYNCED_KEYS = [
  'settings',
  'services',
  'models',
  'prompts',
  // Add any additional keys that should be synced
];

// Configuration keys that should be kept locally only
export const LOCAL_KEYS = [
  'conversations',
  // Add any additional keys that should be kept locally
];

interface ConfigData {
  version: string;
  services?: ServiceConfig[];
  settings?: Record<string, unknown>;
  [key: string]: unknown;
}

// Validate configuration object
export const validateConfig = (config: ConfigData): boolean => {
  // Basic validation
  if (!config || typeof config !== 'object') {
    console.error('Invalid config: Config must be an object');
    return false;
  }

  // Version check
  if (config.version !== CONFIG_VERSION) {
    console.warn(`Config version mismatch: Expected ${CONFIG_VERSION}, got ${config.version}`);
    // Handle version migration here if needed
  }

  // Add more specific validation as needed
  
  return true;
};

// Define the config type to make it easier to work with
type AppConfig = typeof DEFAULT_CONFIG;
type Writable<T> = { -readonly [P in keyof T]: T[P] };
type WritableAppConfig = Writable<AppConfig>;
type PartialAppConfig = Partial<AppConfig>;

// Merge configurations with defaults
export const mergeWithDefaults = (config: PartialAppConfig = {}): AppConfig => {
  // Create a new object with the default config
  const merged: WritableAppConfig = {
    ...DEFAULT_CONFIG,
    settings: { ...DEFAULT_CONFIG.settings },
    services: [...DEFAULT_CONFIG.services],
    models: [...DEFAULT_CONFIG.models],
    conversations: [...DEFAULT_CONFIG.conversations],
    prompts: [...DEFAULT_CONFIG.prompts],
  };
  
  // Merge settings
  if (config.settings) {
    merged.settings = { ...merged.settings, ...config.settings };
  }
  
  // Merge arrays (replace completely for now, could be made more sophisticated)
  if (Array.isArray(config.services)) {
    merged.services = [...config.services];
  }
  
  if (Array.isArray(config.models)) {
    merged.models = [...config.models];
  }
  
  if (Array.isArray(config.conversations)) {
    merged.conversations = [...config.conversations];
  }
  
  if (Array.isArray(config.prompts)) {
    merged.prompts = [...config.prompts];
  }
  
  return merged as AppConfig;
};

// Configuration utilities
export const configUtils = {
  // Get a nested property from config
  get: <T = unknown>(config: ConfigData, path: string, defaultValue?: T): T | undefined => {
    if (!config) return defaultValue;
    
    const keys = path.split('.');
    let result: unknown = config;
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = (result as Record<string, unknown>)[key];
    }
    
    return result === undefined ? defaultValue : result as T;
  },
  
  // Set a nested property in config (immutably)
  set: <T = unknown>(config: ConfigData, path: string, value: T): ConfigData => {
    const keys = path.split('.');
    if (keys.length === 0) return config;
    
    const newConfig = { ...config };
    let current: Record<string, unknown> = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]] = value;
    return newConfig;
  },
  
  // Delete a nested property from config (immutably)
  unset: (config: any, path: string) => {
    const keys = path.split('.');
    if (keys.length === 0) return config;
    
    const newConfig = Array.isArray(config) ? [...config] : { ...config };
    
    if (keys.length === 1) {
      if (Array.isArray(newConfig)) {
        newConfig.splice(parseInt(keys[0]), 1);
      } else {
        delete newConfig[keys[0]];
      }
      return newConfig;
    }
    
    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (current[key] === null || typeof current[key] !== 'object') {
        return newConfig; // Path doesn't exist
      }
      current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current)) {
      current.splice(parseInt(lastKey), 1);
    } else {
      delete current[lastKey];
    }
    
    return newConfig;
  }
};

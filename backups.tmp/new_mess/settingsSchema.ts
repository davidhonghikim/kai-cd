// Centralized schema for all advanced settings
// Each setting is an object with key, label, type, default, description, and section

import { Service } from './types';

export interface SettingSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'section' | 'json';
  default: any;
  description: string;
  section: string;
  title?: string;
  icon?: string;
  keywords?: string[];
  options?: string[]; // for select
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  servers: Service[];
  // ... existing settings
}

export const SETTINGS_SCHEMA: SettingSchema[] = [
  {
    key: 'theme',
    label: 'Theme',
    type: 'select',
    default: 'system',
    description: 'Choose light, dark, or system theme.',
    section: 'UI',
    options: ['system', 'light', 'dark'],
  },
  {
    key: 'timeout',
    label: 'Network Timeout (seconds)',
    type: 'number',
    default: 30,
    description: 'Timeout for API requests.',
    section: 'Network',
  },
  {
    key: 'customHeaders',
    label: 'Custom HTTP Headers',
    type: 'json',
    default: {},
    description: 'Add custom headers to all outgoing requests.',
    section: 'Network',
  },
  {
    key: 'enableLogging',
    label: 'Enable Debug Logging',
    type: 'boolean',
    default: false,
    description: 'Enable verbose logging for troubleshooting.',
    section: 'Advanced',
  },
  {
    key: 'uiDensity',
    label: 'UI Density',
    type: 'select',
    default: 'comfortable',
    description: 'Adjust spacing and density of UI elements.',
    section: 'UI',
    options: ['comfortable', 'compact'],
  },
  {
    section: 'ServerManager',
    title: 'Server Manager',
    description: 'Manage your server connections and endpoints',
    icon: 'server',
    keywords: ['server', 'servers', 'connection', 'connections', 'endpoint', 'endpoints'],
    key: 'serverManager',
    label: 'Server Manager',
    type: 'section',
    default: null
  },
  // Add more settings as needed
]; 
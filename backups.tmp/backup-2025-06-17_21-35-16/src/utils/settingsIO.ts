import { SETTINGS_SCHEMA } from '../config/settingsSchema';
import { storageManager } from '../storage/storageManager';

// Keys used in chrome.storage
export const SETTINGS_KEY = 'settings';
export const SERVERS_KEY = 'servers';

// --- SETTINGS ONLY ---
export async function exportSettingsOnlyWithEndpoints() {
  const settings = await storageManager.get(SETTINGS_KEY, {});
  const servers: any[] = await storageManager.get(SERVERS_KEY, []);
  // Extract endpoints for each server
  const endpoints = servers.map(server => ({
    id: server.id,
    name: server.name,
    type: server.type,
    endpoints: server.endpoints || [],
    url: server.url || '',
  }));
  const data = {
    settings,
    endpoints,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chatdemon-settings-only-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export async function importSettingsOnly(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.settings) throw new Error('Invalid file format');
        const validKeys = new Set(SETTINGS_SCHEMA.map(s => s.key));
        const filteredSettings: Record<string, any> = {};
        for (const key in data.settings) {
          if (validKeys.has(key)) filteredSettings[key] = data.settings[key];
        }
        await storageManager.set(SETTINGS_KEY, filteredSettings);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// --- SERVERS ONLY ---
export async function exportServersOnly() {
  const servers = await storageManager.get(SERVERS_KEY, []);
  const blob = new Blob([JSON.stringify(servers, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chatdemon-servers-only-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export async function importServersOnly(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Accept either array or {servers: [...]}
        const servers = Array.isArray(data) ? data : data.servers;
        if (!Array.isArray(servers)) throw new Error('Invalid file format');
        
        // Validate server data
        for (const server of servers) {
          if (!server.id || !server.name || !server.type) {
            throw new Error('Invalid server data: missing required fields');
          }
        }
        
        await storageManager.set(SERVERS_KEY, servers);
        resolve();
      } catch (err) {
        console.error('Error importing servers:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => {
      console.error('Error reading file:', err);
      reject(err);
    };
    reader.readAsText(file);
  });
}

// --- ALL (SETTINGS + SERVERS) ---
export async function exportAllSettingsAndServers() {
  const [settings, serversRaw] = await Promise.all([
    storageManager.get(SETTINGS_KEY, {}),
    storageManager.get(SERVERS_KEY, []),
  ]);
  const servers: any[] = serversRaw;
  // Extract endpoints for each server
  const endpoints = servers.map(server => ({
    id: server.id,
    name: server.name,
    type: server.type,
    endpoints: server.endpoints || [],
    url: server.url || '',
  }));
  const data = {
    settings,
    servers,
    endpoints,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chatdemon-settings-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export async function importAllSettingsAndServers(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.settings || !data.servers) throw new Error('Invalid file format');
        
        // Validate settings
        const validKeys = new Set(SETTINGS_SCHEMA.map(s => s.key));
        const filteredSettings: Record<string, any> = {};
        for (const key in data.settings) {
          if (validKeys.has(key)) filteredSettings[key] = data.settings[key];
        }
        
        // Validate servers
        for (const server of data.servers) {
          if (!server.id || !server.name || !server.type) {
            throw new Error('Invalid server data: missing required fields');
          }
        }
        
        await Promise.all([
          storageManager.set(SETTINGS_KEY, filteredSettings),
          storageManager.set(SERVERS_KEY, data.servers)
        ]);
        
        resolve();
      } catch (err) {
        console.error('Error importing settings and servers:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => {
      console.error('Error reading file:', err);
      reject(err);
    };
    reader.readAsText(file);
  });
} 
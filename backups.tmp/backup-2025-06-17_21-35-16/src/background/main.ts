/* global console */
import { storageManager } from '../storage/storageManager';
import { handlers, Action } from './handlers';
import { setupKeepAliveListener } from '@/utils/keepAlive';
import { panelHandlers } from './handlers/panelHandlers';
import { RequestHandler } from './types';
import { serviceHandlers } from './handlers/serviceHandlers';
import { SERVERS_KEY } from '../utils/settingsIO';
import { DEFAULT_SERVICES } from '../config/defaults';

// Keep the service worker alive
setupKeepAliveListener();

// Initialize default services
async function initializeDefaultServices() {
  console.log('Initializing default services...');
  try {
    const existingServices = await storageManager.get(SERVERS_KEY, []);
    console.log('Existing services:', existingServices);

    if (!existingServices || existingServices.length === 0) {
      console.log('No services found, creating default services...');
      const servicesWithIds = DEFAULT_SERVICES.map(service => ({
        ...service,
        id: `default_${service.id}_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: service.url.includes('localhost'),
      }));
      await storageManager.set(SERVERS_KEY, servicesWithIds);
      console.log('Default services created successfully:', servicesWithIds);
    } else {
      console.log(`Found ${existingServices.length} existing services.`);
    }
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
}

// Initialize on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason);
  await initializeDefaultServices();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser startup, initializing services...');
  await initializeDefaultServices();
});

// Combine all handlers
const allHandlers = {
  ...handlers,
  ...panelHandlers,
  ...serviceHandlers
};

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: { action: string; payload?: any }, sender, sendResponse) => {
  const { action, payload } = message;
  console.log('Received message:', action, payload);
  
  // Check all handlers for the action
  const handler = allHandlers[action as Action] as RequestHandler;
  if (handler) {
    try {
      // Execute handler and ensure response is sent
      const result = handler(payload, sender, sendResponse);
      if (result instanceof Promise) {
        result.catch((error: Error) => {
          console.error(`Error in handler ${action}:`, error);
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
      }
      return result; // Return the result for sync handlers
    } catch (error) {
      console.error(`Error executing handler ${action}:`, error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }
  
  // If no handler is found, send an error response
  console.error(`No handler found for action: ${action}`);
  sendResponse({ success: false, error: `No handler found for action: ${action}` });
  return false;
});

console.log('Background script initialized.');
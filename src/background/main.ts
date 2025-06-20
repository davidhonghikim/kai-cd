// Comprehensive logging for service worker debugging
console.log('[BACKGROUND] Starting service worker initialization...');

// import { overrideGlobalConsole } from "../utils/logger";
import { initializeStorageMonitoring } from "../utils/storageQuotaManager";

console.log('[BACKGROUND] storageQuotaManager imported successfully');

// overrideGlobalConsole();

console.log('[BACKGROUND] kai-cd background script loaded successfully.');

try {
  // Initialize storage quota monitoring
  console.log('[BACKGROUND] About to initialize storage monitoring...');
  initializeStorageMonitoring();
  console.log('[BACKGROUND] Storage monitoring initialized successfully');

// Listens for a message from the popup to open a service in a new tab.
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    console.log('[BACKGROUND] Received message:', request);
  if (request.action === 'openTab') {
    const { service, view } = request.payload;
    const serviceId = service?.id; // Correctly extract the ID
    const tabUrl = chrome.runtime.getURL('tab.html');

    // Check if a Kai-CD tab is already open
    chrome.tabs.query({ url: tabUrl }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        // Tab exists, focus it and send it the new state
        const tabId = tabs[0].id;
        chrome.tabs.update(tabId, { active: true });
        if (tabs[0].windowId) {
          chrome.windows.update(tabs[0].windowId, { focused: true });
        }
        // Send a message to the existing tab to update its state
        chrome.tabs.sendMessage(tabId, {
          action: 'setState',
          payload: { serviceId, view },
        });
      } else {
        // No tab exists, create a new one. Pass initial state via query params
        // as a fallback for when the message listener isn't ready.
        const params = new URLSearchParams();
        if (serviceId) {
          params.set('serviceId', serviceId);
        }
        if (view) {
          params.set('view', view);
        }
        const finalUrl = `${tabUrl}?${params.toString()}`;
        chrome.tabs.create({ url: finalUrl });
      }
    });
    return true; // Indicates an asynchronous response
  }
});

// Closes the side panel when a tab has finished loading its state.
  chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
      console.log('[BACKGROUND] Received closeSidePanel message:', message);
    if (message.action === 'closeSidePanel' && sender.tab?.id) {
        chrome.sidePanel.setOptions({
            tabId: sender.tab.id,
            enabled: false
        });
    }
}); 

  console.log('[BACKGROUND] All event listeners registered successfully');
  
} catch (error) {
  console.error('[BACKGROUND] CRITICAL ERROR during service worker initialization:', error);
  console.error('[BACKGROUND] Error stack:', error.stack);
  console.error('[BACKGROUND] Error name:', error.name);
  console.error('[BACKGROUND] Error message:', error.message);
  
  // Try to identify what specifically failed
  if (error.message && error.message.includes('window')) {
    console.error('[BACKGROUND] ERROR: window object access in service worker context detected');
  }
} 

chrome.storage.onChanged.addListener((_changes, _namespace) => {
  // Storage change monitoring (currently unused but reserved for future use)
}); 
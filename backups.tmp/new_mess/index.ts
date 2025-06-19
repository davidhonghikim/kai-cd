import { Service } from '../types';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkServerStatus') {
    checkServerStatus(message.data.server)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function checkServerStatus(server: Service): Promise<{ success: boolean; status: string }> {
  try {
    const response = await fetch(server.url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok || response.type === 'opaque') {
      return { success: true, status: 'online' };
    } else {
      return { success: true, status: 'offline' };
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    return { success: true, status: 'offline' };
  }
} 
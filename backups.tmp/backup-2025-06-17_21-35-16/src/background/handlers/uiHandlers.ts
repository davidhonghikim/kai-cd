import { RequestHandler } from './types';

export const openOptionsPage: RequestHandler = async (_payload, _sender, sendResponse) => {
  try {
    await chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error opening options page:', error);
    sendResponse({ success: false, error: 'Failed to open options page' });
  }
};

export const uiHandlers = {
  openOptionsPage
}; 
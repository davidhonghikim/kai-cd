/* global console */
import { storageManager } from '../../storage/storageManager';
import { RequestHandler } from './types';
import { Service } from '../../types';
import { SERVERS_KEY } from '../../utils/settingsIO';

interface SetActiveServicePayload {
  serviceId: string;
}

interface HidePanelPayload {
  tabId: number;
}

interface OpenServiceInTabPayload {
  serviceId: string;
}

/**
 * Sets the active service in storage. This determines which service the panel will display.
 * After setting, it broadcasts a message to notify other parts of the extension.
 */
export const setActiveService: RequestHandler<SetActiveServicePayload, void> = async (payload) => {
  const { serviceId } = payload;
  const services = await storageManager.get<Service[]>(SERVERS_KEY, []);
  const serviceToActivate = services.find(s => s.id === serviceId);
  await storageManager.set('activeService', serviceToActivate || null);
  chrome.runtime.sendMessage({ action: 'activeServiceChanged', payload: serviceToActivate });
};

/**
 * Gets the currently active service from storage.
 */
export const getActiveService: RequestHandler<undefined, { success: boolean; service?: Service | null; error?: string }> = async (_, __, sendResponse) => {
  try {
    const service = await storageManager.get<Service | null>('activeService', null);
    sendResponse({ success: true, service });
  } catch (error) {
    console.error('Error getting active service:', error);
    sendResponse({ success: false, error: 'Failed to get active service' });
  }
};

/**
 * Hides the side panel for a specific tab.
 */
export const hidePanel: RequestHandler<HidePanelPayload, void> = async (payload) => {
  const { tabId } = payload;
  if (tabId) {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
  } else {
    console.warn('hidePanel called without a tabId.');
  }
};

/**
 * Opens the extension's options page.
 */
export const openOptionsPage: RequestHandler = async () => {
  await chrome.runtime.openOptionsPage();
};

/**
 * Opens a service's URL in a new tab, loading the extension's tab UI.
 */
export const openServiceInTab: RequestHandler<OpenServiceInTabPayload, void> = async (payload) => {
  const { serviceId } = payload;
  const services = await storageManager.get<Service[]>(SERVERS_KEY, []);
  const service = services.find((s) => s.id === serviceId);
  if (service) {
    const url = chrome.runtime.getURL(`src/tab/index.html?serviceId=${serviceId}`);
    await chrome.tabs.create({ url });
  } else {
    throw new Error(`Service with id ${serviceId} or its URL not found.`);
  }
};

/**
 * Handles panel state change notifications.
 */
export const handlePanelStateChange = async (message: { payload: { enabled: boolean } }) => {
  const { enabled } = message.payload;
  chrome.runtime.sendMessage({
    action: 'panelStateChanged',
    payload: { enabled }
  });
};

export const panelHandlers = {
  setActiveService,
  getActiveService,
  hidePanel,
  openServiceInTab,
  panelStateChanged: handlePanelStateChange,
};

import { create } from 'zustand';
import { useServiceStore, type Service } from './serviceStore';
import { VIEW_STATES, SELECTED_SERVICE_ID_KEY } from '../config/constants';

export type MainView = typeof VIEW_STATES[keyof typeof VIEW_STATES];
export type ViewLocation = 'tab' | 'panel';
export type TabView = 'chat' | 'services' | 'console' | 'docs' | 'settings';

interface ViewState {
  activeServiceId: string | null;
  setActiveServiceId: (id: string | null) => void;
  views: Record<string, any>;
  updateViewState: (viewId: string, state: any) => void;
  getActiveService: () => Service | null;
}

export const useViewStateStore = create<ViewState>((set, get) => ({
  activeServiceId: null,
  setActiveServiceId: (id: string | null) => {
    console.log(`setActiveServiceId: ${id}`);
    set({ activeServiceId: id });
  },
  views: {},
  updateViewState: (viewId: string, state: any) =>
    set((state) => ({ views: { ...state.views, [viewId]: state } })),
  getActiveService: () => {
    const { activeServiceId } = get();
    return activeServiceId ? useServiceStore.getState().getServiceById(activeServiceId) : null;
  },
}));

// --- Chrome Extension Logic ---

export async function switchToTab(service: Service) {
  // Set the service and view state *before* the tab is created to avoid race conditions.
  useServiceStore.getState().setSelectedServiceId(service.id);
  useViewStateStore.getState().setActiveServiceId(service.id);
  await chrome.storage.local.set({ [SELECTED_SERVICE_ID_KEY]: service.id });

  // Logic to open the service in a new tab
  // Check if a tab for this service is already open
  const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('tab.html') });
  let serviceTab = tabs[0];

  if (serviceTab) {
    await chrome.tabs.update(serviceTab.id!, { active: true });
    await chrome.windows.update(serviceTab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: 'tab.html' });
  }

  // Find the current window's side panel and close it if it's open.
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab?.id) {
        await chrome.sidePanel.setOptions({ tabId: currentTab.id, enabled: false });
    }
  } catch (e) {
      // Fails gracefully if side panel API isn't available.
  }
}

export async function switchToPanel(service: Service) {
  // Set the service and view state *before* opening the panel to avoid race conditions.
  useServiceStore.getState().setSelectedServiceId(service.id);
  useViewStateStore.getState().setActiveServiceId(service.id);

  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (currentTab?.id) {
    await chrome.sidePanel.setOptions({
      tabId: currentTab.id,
      path: 'sidepanel.html',
      enabled: true
    });
    await chrome.sidePanel.open({ tabId: currentTab.id });
  }

  // Close the current tab if it's a service tab
  if (currentTab?.id && currentTab.url?.includes('tab.html')) {
    chrome.tabs.remove(currentTab.id);
  }
} 
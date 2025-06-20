import { create } from 'zustand';
import { useServiceStore, type Service } from './serviceStore';
import { VIEW_STATES, SELECTED_SERVICE_ID_KEY, INITIAL_TAB_VIEW_KEY } from '../config/constants';

export type MainView = typeof VIEW_STATES[keyof typeof VIEW_STATES];
export type ViewLocation = 'tab' | 'panel';
export type TabView = 'chat' | 'image' | 'services' | 'console' | 'docs' | 'settings';

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

const getPrimaryViewForService = (service: Service): TabView => {
    const capabilities = service.capabilities.map(c => c.capability);
    if (capabilities.includes('llm_chat')) {
        return 'chat';
    }
    if (capabilities.includes('image_generation')) {
        return 'image';
    }
    // Add other capability-to-view mappings here
    return 'chat'; // Default fallback
}

export async function switchToTab(service: Service) {
  // Determine the best view for the service based on its capabilities
  const initialView = getPrimaryViewForService(service);

  // Set the service and view state *before* the tab is created to avoid race conditions.
  await chrome.storage.local.set({ 
    [SELECTED_SERVICE_ID_KEY]: service.id,
    [INITIAL_TAB_VIEW_KEY]: initialView
  });
  
  // Logic to open the service in a new tab
  const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('tab.html') });
  let serviceTab = tabs[0];

  if (serviceTab) {
    await chrome.tabs.update(serviceTab.id!, { active: true });
    // Also send a message to the existing tab to update its state
    chrome.tabs.sendMessage(serviceTab.id!, { 
        type: 'SWITCH_SERVICE', 
        serviceId: service.id,
        view: initialView
    });
    await chrome.windows.update(serviceTab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: 'tab.html' });
  }

  // The side panel will be closed by the newly opened/focused tab once it has loaded.
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
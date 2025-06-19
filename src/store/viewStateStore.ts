import { create } from 'zustand';
import { useServiceStore, type Service } from './serviceStore';

export type ViewLocation = 'tab' | 'panel';

interface ViewState {
  activeServiceId: string | null;
  activeLocation: ViewLocation | null;
  setActiveView: (serviceId: string, location: ViewLocation) => void;
  closeView: (location: ViewLocation) => void;
}

export const useViewStateStore = create<ViewState>((set) => ({
  activeServiceId: null,
  activeLocation: null,
  setActiveView: (serviceId, location) => set({ activeServiceId: serviceId, activeLocation: location }),
  closeView: (location) => {
    set((state) => {
      if (state.activeLocation === location) {
        return { activeServiceId: null, activeLocation: null };
      }
      return {};
    });
  },
}));

// --- Chrome Extension Logic ---

export async function switchToTab(service: Service) {
  // Set the service and view state *before* the tab is created to avoid race conditions.
  useServiceStore.getState().setSelectedServiceId(service.id);
  useViewStateStore.getState().setActiveView(service.id, 'tab');

  // Logic to open the service in a new tab
  await chrome.tabs.create({ url: 'tab.html' });

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
  useViewStateStore.getState().setActiveView(service.id, 'panel');

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
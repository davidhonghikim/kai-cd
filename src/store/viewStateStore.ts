import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useServiceStore, type Service } from './serviceStore';
import { chromeStorage } from './chromeStorage';
import { VIEW_STATES } from '../config/constants';
import type { LlmChatCapability } from '../types';

export type MainView = typeof VIEW_STATES[keyof typeof VIEW_STATES];
export type ViewLocation = 'tab' | 'panel';
export type TabView = 'chat' | 'image' | 'services' | 'prompts' | 'artifacts' | 'vault' | 'security' | 'console' | 'docs' | 'settings';

interface ViewState {
  _hasHydrated: boolean;
  activeServiceId: string | null;
  setActiveServiceId: (id: string | null) => void;
  
  // New state for managing UI controls
  activeModel: string | null;
  setActiveModel: (model: string | null) => void;
  
  chatParameters: Record<string, any>;
  setChatParameter: (key: string, value: any) => void;
  initializeChatParameters: (capability: LlmChatCapability) => void;

  // Existing state
  views: Record<string, any>;
  updateViewState: (viewId: string, state: any) => void;
  getActiveService: () => Service | null;
}

export const useViewStateStore = create<ViewState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      activeServiceId: null,
      activeModel: null,
      chatParameters: {},

      setActiveServiceId: (id: string | null) => {
        set({ activeServiceId: id });
        // When the service changes, we need to re-initialize the parameters
        const service = id ? useServiceStore.getState().getServiceById(id) : null;
        const chatCapability = service?.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;
        if (chatCapability) {
          get().initializeChatParameters(chatCapability);
          set({ activeModel: service?.lastUsedModel || chatCapability.parameters.chat.find(p => p.key === 'model')?.defaultValue });
        } else {
          set({ chatParameters: {}, activeModel: null });
        }
      },

      setActiveModel: (model: string | null) => {
        set({ activeModel: model });
        if (get().activeServiceId && model) {
          useServiceStore.getState().updateServiceLastUsedModel(get().activeServiceId!, model);
        }
      },

      setChatParameter: (key: string, value: any) => {
        set(state => ({
          chatParameters: { ...state.chatParameters, [key]: value }
        }));
      },
      
      initializeChatParameters: (capability: LlmChatCapability) => {
        const initialState: Record<string, any> = {};
        capability.parameters.chat.forEach(param => {
          initialState[param.key] = param.defaultValue;
        });
        set({ chatParameters: initialState });
      },

      views: {},
      updateViewState: (viewId: string, newState: any) =>
        set((state) => ({ views: { ...state.views, [viewId]: newState } })),
      getActiveService: () => {
        const { activeServiceId } = get();
        return activeServiceId ? useServiceStore.getState().getServiceById(activeServiceId) : null;
      },
    }),
    {
      name: 'kai-view-state-storage',
      storage: createJSONStorage(() => chromeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
      partialize: (state) => ({
        // Only persist what's necessary, not functions or transient state
        activeServiceId: state.activeServiceId,
        activeModel: state.activeModel,
        chatParameters: state.chatParameters,
        views: state.views,
      }),
    }
  )
);

// --- Chrome Extension Logic ---

// Helper to determine the best initial view for a service
const getPrimaryViewForService = (service: Service): TabView => {
    const capabilities = service.capabilities.map(c => c.capability);
    if (capabilities.includes('llm_chat')) return 'chat';
    if (capabilities.includes('image_generation')) return 'image';
    return 'chat'; // Default fallback
}

/**
 * Opens the main Kai-CD tab view. Can be called with a service to open a service-specific
 * view, or with a generic TabView string to open a manager view (e.g., 'settings').
 */
export async function switchToTab(payload: Service | TabView) {
  let messagePayload: { service?: Service, view: TabView };

  if (typeof payload === 'string') {
    // It's a generic view like 'settings' or 'docs'
    messagePayload = { view: payload };
  } else {
    // It's a service object
    messagePayload = { service: payload, view: getPrimaryViewForService(payload) };
  }

  // Close the side panel if it's open
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (currentTab?.id) {
      await chrome.sidePanel.setOptions({ tabId: currentTab.id, enabled: false });
    }
  } catch (error) {
    console.log('Side panel not available or already closed');
  }

  chrome.runtime.sendMessage({
    action: 'openTab',
    payload: messagePayload
  });
}

/**
 * Opens a service in the side panel.
 */
export async function switchToPanel(service: Service) {
  // Directly set the state for the panel to use.
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
}
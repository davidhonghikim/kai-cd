import { create } from 'zustand';

export interface ComponentState {
  isVisible: boolean;
  isActive: boolean;
  hasData: boolean;
  lastActivity: number;
}

export interface TooltipState {
  content: string;
  position: { x: number; y: number };
  variant: 'default' | 'info' | 'warning' | 'error' | 'success';
  isVisible: boolean;
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
}

interface UICommunicationState {
  // Component awareness
  components: {
    passwordGenerator: ComponentState;
    passwordAnalyzer: ComponentState;
    hashGenerator: ComponentState;
    encodingTools: ComponentState;
    pgpKeys: ComponentState;
    sshKeys: ComponentState;
    cryptoToolkit: ComponentState;
    vault: ComponentState;
    securityHub: ComponentState;
  };
  
  // Active component tracking
  activeComponent: string | null;
  activeSecurityTool: string | null;
  
  // Cross-component data flow
  pendingTransfers: Array<{
    from: string;
    to: string;
    data: any;
    type: string;
    timestamp: number;
  }>;
  
  // Global tooltip state
  tooltip: TooltipState;
  
  // Notification system
  notifications: NotificationState[];
  
  // UI settings
  tooltipsEnabled: boolean;
  animationsEnabled: boolean;
  accessibilityMode: boolean;
}

interface UICommunicationActions {
  // Component state management
  updateComponentState: (componentId: string, state: Partial<ComponentState>) => void;
  setActiveComponent: (componentId: string | null) => void;
  setActiveSecurityTool: (toolId: string | null) => void;
  
  // Data transfer between components
  initiateTransfer: (from: string, to: string, data: any, type: string) => void;
  consumeTransfer: (to: string) => any;
  clearTransfers: (to?: string) => void;
  
  // Tooltip management
  showTooltip: (content: string, position: { x: number; y: number }, variant?: TooltipState['variant']) => void;
  hideTooltip: () => void;
  
  // Notification system
  addNotification: (message: string, type: NotificationState['type'], duration?: number) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI settings
  setTooltipsEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAccessibilityMode: (enabled: boolean) => void;
  
  // Utility functions
  getComponentData: (componentId: string) => ComponentState;
  isComponentActive: (componentId: string) => boolean;
  getActiveComponents: () => string[];
}

const defaultComponentState: ComponentState = {
  isVisible: false,
  isActive: false,
  hasData: false,
  lastActivity: 0
};

const useUICommunicationStore = create<UICommunicationState & UICommunicationActions>((set, get) => ({
  // Initial state
  components: {
    passwordGenerator: { ...defaultComponentState },
    passwordAnalyzer: { ...defaultComponentState },
    hashGenerator: { ...defaultComponentState },
    encodingTools: { ...defaultComponentState },
    pgpKeys: { ...defaultComponentState },
    sshKeys: { ...defaultComponentState },
    cryptoToolkit: { ...defaultComponentState },
    vault: { ...defaultComponentState },
    securityHub: { ...defaultComponentState }
  },
  
  activeComponent: null,
  activeSecurityTool: null,
  pendingTransfers: [],
  tooltip: {
    content: '',
    position: { x: 0, y: 0 },
    variant: 'default',
    isVisible: false
  },
  notifications: [],
  tooltipsEnabled: true,
  animationsEnabled: true,
  accessibilityMode: false,

  // Actions
  updateComponentState: (componentId: string, state: Partial<ComponentState>) => {
    set((current) => ({
      components: {
        ...current.components,
        [componentId]: {
          ...current.components[componentId as keyof typeof current.components],
          ...state,
          lastActivity: Date.now()
        }
      }
    }));
  },

  setActiveComponent: (componentId: string | null) => {
    set({ activeComponent: componentId });
    
    // Update component states
    if (componentId) {
      get().updateComponentState(componentId, { isActive: true });
    }
  },

  setActiveSecurityTool: (toolId: string | null) => {
    set({ activeSecurityTool: toolId });
  },

  initiateTransfer: (from: string, to: string, data: any, type: string) => {
    set((current) => ({
      pendingTransfers: [
        ...current.pendingTransfers,
        {
          from,
          to,
          data,
          type,
          timestamp: Date.now()
        }
      ]
    }));
  },

  consumeTransfer: (to: string) => {
    const { pendingTransfers } = get();
    const transfer = pendingTransfers.find(t => t.to === to);
    
    if (transfer) {
      set((current) => ({
        pendingTransfers: current.pendingTransfers.filter(t => t !== transfer)
      }));
      return transfer.data;
    }
    
    return null;
  },

  clearTransfers: (to?: string) => {
    set((current) => ({
      pendingTransfers: to 
        ? current.pendingTransfers.filter(t => t.to !== to)
        : []
    }));
  },

  showTooltip: (content: string, position: { x: number; y: number }, variant = 'default' as const) => {
    const { tooltipsEnabled } = get();
    if (!tooltipsEnabled) return;
    
    set({
      tooltip: {
        content,
        position,
        variant,
        isVisible: true
      }
    });
  },

  hideTooltip: () => {
    set((current) => ({
      tooltip: {
        ...current.tooltip,
        isVisible: false
      }
    }));
  },

  addNotification: (message: string, type: NotificationState['type'], duration = 5000) => {
    const id = crypto.randomUUID();
    const notification: NotificationState = {
      id,
      message,
      type,
      timestamp: Date.now(),
      duration
    };
    
    set((current) => ({
      notifications: [...current.notifications, notification]
    }));
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
    
    return id;
  },

  removeNotification: (id: string) => {
    set((current) => ({
      notifications: current.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setTooltipsEnabled: (enabled: boolean) => {
    set({ tooltipsEnabled: enabled });
    if (!enabled) {
      get().hideTooltip();
    }
  },

  setAnimationsEnabled: (enabled: boolean) => {
    set({ animationsEnabled: enabled });
  },

  setAccessibilityMode: (enabled: boolean) => {
    set({ accessibilityMode: enabled });
  },

  getComponentData: (componentId: string) => {
    return get().components[componentId as keyof typeof get().components] || defaultComponentState;
  },

  isComponentActive: (componentId: string) => {
    return get().components[componentId as keyof typeof get().components]?.isActive || false;
  },

  getActiveComponents: () => {
    const { components } = get();
    return Object.entries(components)
      .filter(([_, state]) => state.isActive)
      .map(([id]) => id);
  }
}));

export default useUICommunicationStore; 
import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/components/popup/Popup.module.css';
import type { Service, ServiceResponse } from '@/types';
import { sendMessage } from '@/utils/chrome';
import { connectToBackground } from '@/utils/keepAlive';
import '@/styles/global.css';

const App: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isPanelEnabled, setIsPanelEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectToBackground('popup');
  }, []);

  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };
  
  const openOptionsPage = () => sendMessage('openOptionsPage');

  const updatePanelState = useCallback(async () => {
    try {
      const response = await sendMessage('getPanelState') as { isOpen: boolean };
      if (response?.isOpen) {
        chrome.runtime.sendMessage({ action: 'openPanel' });
      }
    } catch (error) {
      console.error('Error updating panel state:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all services
      const response = await sendMessage('getServices') as ServiceResponse;
      if (!response || typeof response !== 'object' || !('success' in response)) {
        setError('No response from background. Check extension logs.');
        setServices([]);
        setActiveService(null);
        return;
      }
      if (response.success) {
        console.log('Loaded services:', response.services);
        setServices(response.services || []);
      } else {
        console.error('Failed to load services:', response.error);
        setError(response.error || 'Failed to load services');
        setServices([]);
      }

      // Get active service
      const activeResponse = await sendMessage('getActiveService') as ServiceResponse;
      if (activeResponse.success) {
        setActiveService(activeResponse.service ?? null);
      } else {
        console.error('Failed to get active service:', activeResponse.error);
        setActiveService(null);
      }

      // Update panel state
      await updatePanelState();
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
      setServices([]);
      setActiveService(null);
    } finally {
      setIsLoading(false);
    }
  }, [updatePanelState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for panel state changes
  useEffect(() => {
    const handlePanelStateChange = async (message: any) => {
      if (message.action === 'activeServiceChanged') {
        setActiveService(message.payload);
        await updatePanelState();
      } else if (message.action === 'panelStateChanged') {
        setIsPanelEnabled(message.payload.enabled);
      }
    };

    chrome.runtime.onMessage.addListener(handlePanelStateChange);
    return () => {
      chrome.runtime.onMessage.removeListener(handlePanelStateChange);
    };
  }, [updatePanelState]);

  const handleTogglePanel = async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    const windowId = tab.windowId;

    try {
      if (isPanelEnabled) {
        // Hide panel
        await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
        setIsPanelEnabled(false);
        setActiveService(null);
        // Notify other components about panel state change
        chrome.runtime.sendMessage({ action: 'panelStateChanged', payload: { enabled: false } });
      } else {
        // Show panel
        await chrome.sidePanel.setOptions({ 
          tabId: tab.id, 
          path: 'src/sidepanel/index.html',
          enabled: true 
        });
        await chrome.sidePanel.open({ windowId });
        setIsPanelEnabled(true);
        // If we have an active service, ensure it's set
        if (activeService) {
          const response = await sendMessage('setActiveService', { serviceId: activeService.id });
          if (!response.success) {
            console.error('Failed to set active service:', (response as any).error?.toString());
          }
        }
        // Notify other components about panel state change
        chrome.runtime.sendMessage({ action: 'panelStateChanged', payload: { enabled: true } });
      }
      // Update panel state after changes
      await updatePanelState();
    } catch (error) {
      console.error('Failed to toggle panel:', error);
      // Revert state on error
      await updatePanelState();
    }
  };

  const handleOpenInPanel = async (service: Service) => {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    const windowId = tab.windowId;

    try {
      const response = await sendMessage('setActiveService', { serviceId: service.id });
      if (!response.success) {
        console.error('Failed to set active service:', (response as any).error?.toString());
        return;
      }

      await chrome.sidePanel.setOptions({ 
        tabId: tab.id, 
        path: 'src/sidepanel/index.html',
        enabled: true 
      });
      await chrome.sidePanel.open({ windowId });
      setIsPanelEnabled(true);
      setActiveService(service);
      await updatePanelState();
    } catch (error) {
      console.error('Failed to open in panel:', error);
      await updatePanelState();
    }
  };

  const handleOpenInTab = async (service: Service) => {
    try {
      const response = await sendMessage('openInTab', { serviceId: service.id }) as ServiceResponse;
      if (!response.success) {
        console.error('Failed to open in tab:', response.error);
        setError(response.error || 'Failed to open in tab');
      }
    } catch (error) {
      console.error('Error opening in tab:', error);
      setError('Failed to open in tab');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.app}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>ChatDemon</h1>
        <div className={styles.actions}>
          <button
            onClick={handleTogglePanel}
            className={styles.actionButton}
            disabled={services.length === 0}
            title={isPanelEnabled ? 'Hide Side Panel' : 'Show Side Panel'}
          >
            {isPanelEnabled ? 'Hide Panel' : 'Show Panel'}
          </button>
          <button onClick={openOptionsPage} className={styles.actionButton} title="Manage Services">
            Manage
          </button>
        </div>
      </header>
      <main className={styles.main}>
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className={styles.serviceCard}>
              <span className={styles.serviceName}>{service.name}</span>
              <div className={styles.serviceActions}>
                <button onClick={() => handleOpenInTab(service)}>Tab</button>
                <button onClick={() => handleOpenInPanel(service)}>
                  {isPanelEnabled && activeService?.id === service.id ? 'Active' : 'Panel'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noServices}>
            <p>No services configured.</p>
            <button onClick={openOptionsPage}>Add a Service</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App; 
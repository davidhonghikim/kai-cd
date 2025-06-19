import React, { useState, useEffect } from 'react';
import { Service } from '@/types';
import { sendMessage } from '@/utils/chrome';
import ViewRouter from '@/components/ViewRouter';
import styles from '@/styles/components/sidepanel/SidePanel.module.css';
import { connectToBackground } from '@/utils/keepAlive';

const SidePanel: React.FC = () => {
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    connectToBackground('sidepanel');

    const initialize = async () => {
      setIsLoading(true);
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          // Store the tab ID for panel state management
          await chrome.storage.session.set({ sidePanelTabId: tab.id });
          
          // Ensure panel is enabled for this tab
          await chrome.sidePanel.setOptions({ 
            tabId: tab.id, 
            path: 'src/sidepanel/index.html',
            enabled: true 
          });
          
          // Notify other components about panel state
          chrome.runtime.sendMessage({ action: 'panelStateChanged', payload: { enabled: true } });
        }
        
        const service = await sendMessage<Service | null>('getActiveService', null);
        setActiveService(service);
      } catch (error) {
        console.error('Failed to initialize side panel:', error);
      }
      setIsLoading(false);
    };
    initialize();

    const handleServiceChange = (message: any) => {
      if (message.action === 'activeServiceChanged') {
        setActiveService(message.payload);
      }
    };
    
    const handlePanelStateChange = (message: any) => {
      if (message.action === 'panelStateChanged') {
        // Update local state if needed
        console.log('Panel state changed:', message.payload);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleServiceChange);
    chrome.runtime.onMessage.addListener(handlePanelStateChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleServiceChange);
      chrome.runtime.onMessage.removeListener(handlePanelStateChange);
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <div className={styles.placeholder}>Loading...</div>;
    }
    if (!activeService) {
      console.error('No active service loaded in panel.');
      return (
        <div className={styles.placeholder} style={{ color: 'red' }}>
          <h2>No service loaded</h2>
          <p>Please select a service in the extension popup.</p>
        </div>
      );
    }
    console.log('Loaded activeService in panel:', activeService);
    // The ViewRouter will handle rendering the correct component for the service.
    return <ViewRouter service={activeService} onClose={() => {}} />;
  };

  return <div className={styles.sidePanel}>{renderContent()}</div>;
};

export default SidePanel;
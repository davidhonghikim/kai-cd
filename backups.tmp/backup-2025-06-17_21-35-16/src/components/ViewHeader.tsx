import React from 'react';
import { Service } from '@/types';
import { sendMessage } from '@/utils/chrome';
import styles from '@/styles/components/ViewHeader.module.css';

interface ViewHeaderProps {
  service: Service;
  isTab?: boolean;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({ service, isTab = false }) => {
  const handleSwitchView = async () => {
    if (isTab) {
      // Logic to switch from a tab to the panel
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          // First set the active service
        await sendMessage('setActiveService', { serviceId: service.id });
          
          // Initialize the panel with the correct path
          await chrome.sidePanel.setOptions({ 
            tabId: tab.id, 
            path: 'src/sidepanel/index.html',
            enabled: true 
          });
          
          // Open the panel
        await chrome.sidePanel.open({ tabId: tab.id });
          
          // Close the current tab
        await chrome.tabs.remove(tab.id);
        } catch (error) {
          console.error('Failed to switch to panel:', error);
        }
      }
    } else {
      // Logic to switch from the panel to a tab
      try {
        // First hide the panel
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab?.id) {
          await chrome.sidePanel.setOptions({ tabId: currentTab.id, enabled: false });
          // Notify other components about panel state change
          chrome.runtime.sendMessage({ action: 'panelStateChanged', payload: { enabled: false } });
        }
        
        // Then open or focus the tab
        const url = chrome.runtime.getURL(`src/tab/index.html?serviceId=${service.id}`);
        const tabs = await chrome.tabs.query({ url });
        if (tabs.length > 0) {
          // Focus the existing tab
          await chrome.tabs.update(tabs[0].id!, { active: true });
      } else {
          // Open a new tab
          await sendMessage('openServiceInTab', { serviceId: service.id });
        }
      } catch (error) {
        console.error('Failed to switch to tab:', error);
      }
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{service.name}</h1>
      <button onClick={handleSwitchView} className={styles.switchButton}>
        {isTab ? 'Switch to Panel' : 'Switch to Tab'}
      </button>
    </header>
  );
};

export default ViewHeader; 
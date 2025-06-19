import React from 'react';
import type { Service } from '@/types';
import type { LLMModel } from '@/types';
import { sendMessage } from '@/utils/chrome';
import styles from '@/styles/components/ChatHeader.module.css';

interface ChatHeaderProps {
  service: Service;
  isTab: boolean;
  models: LLMModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  service,
  isTab,
  models,
  selectedModel,
  onModelChange,
}) => {
  const handleSwitchView = async () => {
    if (isTab) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await sendMessage('setActiveService', { serviceId: service.id });
        await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: true });
        await chrome.sidePanel.open({ windowId: tab.windowId });
        await chrome.tabs.remove(tab.id);
      }
    } else {
      sendMessage('openServiceInTab', { serviceId: service.id });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{service.name}</h1>
        {models.length > 0 && (
          <select
            className={styles.modelSelector}
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button onClick={handleSwitchView} className={styles.switchButton}>
        {isTab ? 'Switch to Panel' : 'Switch to Tab'}
      </button>
    </header>
  );
};

export default ChatHeader; 
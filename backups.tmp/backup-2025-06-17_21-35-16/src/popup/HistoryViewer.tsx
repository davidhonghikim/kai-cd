import React from 'react';
import styles from '@/styles/components/popup/HistoryViewer.module.css';
import { Conversation } from '@/types';
import { sendMessage } from '@/utils/chrome';

interface HistoryViewerProps {
  onClose: () => void;
  conversations: Conversation[];
  onDelete: (conversationId: string) => void;
  onLoad: (conversationId: string) => void;
  onImport: () => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({
  onClose,
  conversations,
  onDelete,
  onLoad,
  onImport,
}) => {
  const handleExport = async () => {
    const historyToExport = await sendMessage('getChatHistory');
    const dataStr = JSON.stringify(historyToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatdemon-history-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const historyToImport = JSON.parse(e.target?.result as string);
        if (Array.isArray(historyToImport)) {
          await sendMessage('importChatHistory', historyToImport);
          onImport(); // Notify parent to refresh
          alert('History imported successfully!');
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (error: any) {
        alert(`Error importing history: ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2>Conversation History</h2>
          <div className={styles.headerActions}>
            <button onClick={handleExport}>Export All</button>
            <label className={styles.importButton}>
              Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </header>
        <div className={styles.content}>
          {conversations.length > 0 ? (
            conversations.map((convo) => (
              <div key={convo.id} className={styles.convoItem}>
                <div className={styles.convoInfo}>
                  <span>{new Date(convo.timestamp).toLocaleString()}</span>
                  <small>Service ID: {convo.serviceId}</small>
                  <small>{convo.messages.length} messages</small>
                </div>
                <div className={styles.convoActions}>
                  <button onClick={() => onLoad(convo.id)}>Load</button>
                  <button
                    onClick={() => onDelete(convo.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No saved conversations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryViewer; 
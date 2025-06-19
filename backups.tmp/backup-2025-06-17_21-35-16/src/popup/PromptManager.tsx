import React, { useState } from 'react';
import styles from '@/styles/components/popup/PromptManager.module.css';
import { Prompt } from '@/types';

interface PromptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSave: (prompt: Omit<Prompt, 'id'>) => void;
  onDelete: (promptId: string) => void;
  onUse: (promptContent: string) => void;
}

const PromptManager: React.FC<PromptManagerProps> = ({
  isOpen,
  onClose,
  prompts,
  onSave,
  onDelete,
  onUse,
}) => {
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      alert('Prompt name and content are required.');
      return;
    }
    const promptData = {
      name: newPromptName,
      content: newPromptContent,
      category: 'general',
      tags: []
    };
    onSave(promptData);
    setNewPromptName('');
    setNewPromptContent('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2>Prompt Manager</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </header>
        <div className={styles.content}>
          <div className={styles.addPromptForm}>
            <h3>Add New Prompt</h3>
            <input
              type="text"
              placeholder="Prompt Name"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
            />
            <textarea
              placeholder="Prompt Content"
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              rows={4}
            />
            <button onClick={handleSave}>Save Prompt</button>
          </div>
          <div className={styles.promptList}>
            <h3>Saved Prompts</h3>
            {prompts.length > 0 ? (
              prompts.map((prompt) => (
                <div key={prompt.id} className={styles.promptItem}>
                  <div className={styles.promptInfo}>
                    <strong>{prompt.name}</strong>
                    <p>{prompt.content}</p>
                  </div>
                  <div className={styles.promptActions}>
                    <button onClick={() => onUse(prompt.content)}>Use</button>
                    <button
                      onClick={() => onDelete(prompt.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No saved prompts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptManager; 
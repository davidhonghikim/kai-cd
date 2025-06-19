import React from 'react';
import { ChatMessage } from '@/types';
import styles from '@/styles/components/popup/Message.module.css';

interface MessageProps {
  message: ChatMessage;
  onGenerateImage: (prompt: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onGenerateImage }) => {
  return (
    <div className={`${styles.message} ${styles[message.role]}`}>
      <p>{message.content}</p>
      {message.role === 'user' && (
        <div className={styles.actions}>
          <button onClick={() => onGenerateImage(message.content)}>
            🎨 Generate Image
          </button>
        </div>
      )}
    </div>
  );
};

export default Message; 
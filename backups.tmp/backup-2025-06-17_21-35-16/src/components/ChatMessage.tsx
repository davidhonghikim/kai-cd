import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/types';
import styles from '@/styles/components/sidepanel/ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessage;
  onGenerateImage: (prompt: string) => void;
  onEditRequest: (code: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onGenerateImage, onEditRequest }) => {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = (code: string, language: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snippet.${language || 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${styles.message} ${styles[message.role]}`}>
      <div className={styles.messageContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeText = String(children).replace(/\n$/, '');
              return match ? (
                <div className={styles.codeBlock}>
                  <div className={styles.codeHeader}>
                    <span>{match[1]}</span>
                    <div className={styles.codeActions}>
                      <button title="Edit" onClick={() => onEditRequest(codeText)}>✏️</button>
                      <button title="Download" onClick={() => handleDownload(codeText, match[1])}>💾</button>
                      <button title="Copy" onClick={() => handleCopy(codeText)}>📋</button>
                    </div>
                  </div>
                  <pre><code {...props} className={className}>{children}</code></pre>
                </div>
              ) : (
                <code {...props} className={styles.inlineCode}>{children}</code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {message.role === 'assistant' && (
        <div className={styles.messageActions}>
          <button title="Image" onClick={() => onGenerateImage(message.content)}>🖼️</button>
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;

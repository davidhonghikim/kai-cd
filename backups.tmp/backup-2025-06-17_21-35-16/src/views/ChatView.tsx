import React, { useState, useEffect, useRef } from 'react';
import type { Service, ChatMessage, LLMModel } from '@/types';
import { sendMessage } from '@/utils/chrome';
import ChatMessageComponent from '@/components/ChatMessage';
import styles from '@/styles/views/ChatView.module.css';

interface ChatViewProps {
  service: Service;
  isTab?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ service, isTab = false }) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        if (service) {
          const [fetchedModels, fetchedHistory] = await Promise.all([
            sendMessage<LLMModel[]>('getModels', { serviceId: service.id }),
            sendMessage<ChatMessage[]>('getChatHistory', { serviceId: service.id }),
          ]);
          setModels(fetchedModels || []);
          setMessages(fetchedHistory || []);
          setSelectedModel((fetchedModels && fetchedModels[0]?.id) || '');
        }
      } catch (error) {
        console.error('Failed to initialize chat view:', error);
      }
    };
    initialize();
  }, [service]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !service) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt('');

    try {
      const response = await sendMessage<ChatMessage>('sendMessage', {
        serviceId: service.id,
        messages: newMessages,
        model: selectedModel,
      });
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Error: Could not get a response from the service.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleGenerateImage = async (p: string) => console.log('Image generation requested for:', p);
  const handleEditRequest = (code: string) => setPrompt(prev => `${prev}\n\n\`\`\`\n${code}\n\`\`\``);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (service) {
      sendMessage('setDefaultModel', { serviceId: service.id, modelId });
    }
  };

  const handleSwitchView = () => {
    if (isTab) {
      // Logic to switch to panel (implemented in ServiceTab.tsx)
    } else {
      sendMessage('openServiceInTab', { serviceId: service.id });
    }
  };

  const renderHeader = (title: string, showControls: boolean = false) => (
    <header className={styles.header}>
      <h1>{title}</h1>
      <div className={styles.controls}>
        {showControls && models.length > 0 && (
          <select className={styles.modelSelector} value={selectedModel} onChange={(e) => handleModelChange(e.target.value)}>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        )}
        <button onClick={handleSwitchView} className={styles.switchButton}>
          {isTab ? 'Switch to Panel' : 'Switch to Tab'}
        </button>
      </div>
    </header>
  );

  return (
    <div className={styles.chatView}>
      {renderHeader(service.name, true)}
      <div className={styles.chatContainer} ref={chatContainerRef}>
        {messages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            message={msg}
            onGenerateImage={handleGenerateImage}
            onEditRequest={handleEditRequest}
          />
        ))}
      </div>
      <form className={styles.promptForm} onSubmit={handleSendMessage}>
        <textarea
          className={styles.promptInput}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e as any);
            }
          }}
        />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
    </div>
  );
};

export default ChatView;

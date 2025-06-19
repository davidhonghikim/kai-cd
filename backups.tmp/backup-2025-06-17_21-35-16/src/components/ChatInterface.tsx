import React, { useState, useEffect } from 'react';
import { Service, LLMModel } from '@/types';
import { sendMessage } from '@/utils/chrome';
import styles from '@/styles/components/ChatInterface.module.css';
import ChatHeader from './ChatHeader';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { getChatSessions, saveChatSession, getCurrentSessionId, setCurrentSessionId } from '@/background/utils/storage';
import type { ChatMessage, ChatSession } from '@/types';

interface ChatInterfaceProps {
  service: Service;
  isPanel?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ service, isPanel = false }) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);
  const [sendOnlyPrompt, setSendOnlyPrompt] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      if (service) {
        try {
          const fetchedModels = await sendMessage<LLMModel[]>('getModels', { serviceId: service.id });
          setModels(fetchedModels || []);
          setSelectedModel((fetchedModels && fetchedModels[0]?.id) || '');
        } catch (error) {
          console.error("Failed to fetch models:", error);
        }
      }
    };
    fetchModels();
  }, [service]);

  useEffect(() => {
    const loadSessions = async () => {
      const allSessions = await getChatSessions(service.id);
      setSessions(allSessions.filter(s => s.messages && s.messages.length > 0));
      
      let sessionId = await getCurrentSessionId(service.id);
      if (!sessionId && allSessions.length > 0) {
        sessionId = allSessions[allSessions.length - 1].id;
        await setCurrentSessionId(service.id, sessionId);
      }
      setCurrentSessionIdState(sessionId);
      
      if (sessionId) {
        const session = allSessions.find(s => s.id === sessionId);
        if (session) {
          setMessages(session.messages);
        }
      }
    };
    
    loadSessions();
  }, [service.id]);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    sendMessage('setDefaultModel', { serviceId: service.id, modelId });
  };

  const handleNewChat = async () => {
    if (!service) return;
    setCurrentSessionIdState(null);
    setMessages([]);
  };

  const handleSessionSelect = async (sessionId: string) => {
    await setCurrentSessionId(service.id, sessionId);
    setCurrentSessionIdState(sessionId);
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    let sessionId = currentSessionId || uuidv4();
    let session = sessions.find(s => s.id === sessionId);
    if (!session) {
      session = { 
        id: sessionId, 
        createdAt: Date.now(), 
        updatedAt: Date.now(),
        messages: [] 
      };
      setCurrentSessionIdState(sessionId);
    }
    const newMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };
    let updatedMessages = [...(session?.messages || []), newMessage];
    setMessages(updatedMessages);
    setPrompt('');
    try {
      const toSend = sendOnlyPrompt ? [newMessage] : updatedMessages;
      const fullHistory = await sendMessage('sendMessage', {
        serviceId: service.id,
        messages: toSend,
        model: selectedModel,
        sessionId: sessionId as string,
      });
      setMessages(fullHistory);
      const updatedSession: ChatSession = {
        ...(session || {}),
        id: sessionId,
        createdAt: session?.createdAt || Date.now(),
        updatedAt: session?.updatedAt || Date.now(),
        messages: fullHistory
      };
      await saveChatSession(service.id, updatedSession);
      const allSessions = await getChatSessions(service.id);
      setSessions(allSessions.filter(s => s.messages && s.messages.length > 0));
      setCurrentSessionIdState(sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      let displayMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          displayMessage = 'Access Denied (Error 403). Please check if an API key is required and correctly configured for this service in the settings.';
        } else {
          displayMessage = error.message;
        }
      }
      setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: `Error: ${displayMessage}`, timestamp: Date.now() }]);
    }
  };

  const handleSettings = () => {
    sendMessage('openOptionsPage');
  };

  return (
    <div className={`${styles.appContainer} ${isPanel ? styles.panel : ''}`}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.newChatButton} onClick={handleNewChat}>+ New Chat</button>
        </div>
        <div className={styles.chatHistory}>
          <h2 className={styles.historyTitle}>History</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sessions.map(session => (
              <li key={session.id}>
                <button
                  style={{
                    width: '100%',
                    background: session.id === currentSessionId ? '#e0e7ff' : 'transparent',
                    color: session.id === currentSessionId ? '#1e40af' : '#333',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 12px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    fontWeight: session.id === currentSessionId ? 600 : 500,
                    fontSize: 15,
                  }}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  {new Date(session.createdAt).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.sidebarFooter}>
          <button className={styles.settingsButton} onClick={handleSettings}>Settings</button>
        </div>
      </div>
      <div className={styles.mainChatArea}>
        <ChatHeader
          service={service}
          isTab={!isPanel}
          models={models}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
        <div className={styles.conversationArea}>
          {messages.length === 0 ? (
             <div className={`${styles.message} ${styles.aiMessage}`}>
              <p>Hello! This is the chat interface for {service.name}.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className, node, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <SyntaxHighlighter
                          PreTag="div"
                          language={match[1]}
                          style={vscDarkPlus as any}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ))
          )}
        </div>
        <div className={styles.inputArea}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <label style={{ fontSize: 14 }}>
              <input type="checkbox" checked={sendOnlyPrompt} onChange={e => setSendOnlyPrompt(e.target.checked)} style={{ marginRight: 6 }} />
              Send only current prompt
            </label>
          </div>
          <textarea
            className={styles.textInput} 
            placeholder="Send a message..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            rows={1}
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
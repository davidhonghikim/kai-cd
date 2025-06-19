import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type { LlmChatCapability, ChatMessage } from '../../types';
import ParameterControl from './ParameterControl';
import { useServiceStore } from '../../store/serviceStore';
import { apiClient } from '../../utils/apiClient';

interface LlmChatViewProps {
  capability: LlmChatCapability;
}

const LlmChatView: React.FC<LlmChatViewProps> = ({ capability }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedService, chatHistory, addChatMessage, clearChatHistory } = useServiceStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = selectedService ? chatHistory[selectedService.id] || [] : [];

  const [formState, setFormState] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    capability.parameters.chat.forEach(param => {
      initialState[param.key] = param.defaultValue;
    });
    return initialState;
  });

  const handleParameterChange = (key: string, value: any) => {
    setFormState(prevState => ({ ...prevState, [key]: value }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedService) return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'user', content: input };
    addChatMessage(selectedService.id, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const chatEndpoint = capability.endpoints.chat;
      if (!chatEndpoint) throw new Error('Chat endpoint not defined for this service');

      const currentHistory = useServiceStore.getState().chatHistory[selectedService.id] || [];
      const payload = {
        ...formState,
        messages: currentHistory.map(({ role, content }) => ({ role, content })),
      };

      const response = await apiClient.post(selectedService.url, chatEndpoint.path, payload);
      
      const assistantMessageContent = response.choices[0].message.content;
      const assistantMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'assistant', content: assistantMessageContent };
      addChatMessage(selectedService.id, assistantMessage);

    } catch (error) {
      const errorMessageContent = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessageContent}`);
      const errorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = { role: 'assistant', content: `Sorry, I encountered an error. Please try again.` };
      if (selectedService) {
        addChatMessage(selectedService.id, errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (selectedService) {
      clearChatHistory(selectedService.id);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800 text-white flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">LLM Chat</h3>
        <button
          onClick={handleClearHistory}
          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Clear History
        </button>
      </div>
      <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-900 rounded-md">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`} style={{ maxWidth: '80%' }}>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && (
          <div className="mb-2 p-2 rounded-lg bg-gray-700 mr-auto" style={{ maxWidth: '80%' }}>
            <p className="text-sm">Thinking...</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 rounded-r-md hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
      <div className="mt-4 p-4 border-t border-gray-700">
        <h4 className="font-semibold mb-2">Chat Parameters</h4>
        <div className="space-y-4">
          {capability.parameters.chat.map(param => (
            !['messages', 'stream'].includes(param.key) && (
              <ParameterControl
                key={param.key}
                definition={param}
                value={formState[param.key]}
                onChange={(value) => handleParameterChange(param.key, value)}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default LlmChatView; 
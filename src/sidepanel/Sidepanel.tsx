import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useServiceStore } from '../store/serviceStore';
import type { LlmChatCapability, ChatMessage, Service } from '../types';
import { apiClient } from '../utils/apiClient';

const Sidepanel: React.FC = () => {
  const { services, chatHistory, addChatMessage } = useServiceStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const llmServices = services.filter(s => s.capabilities.some(c => c.capability === 'llm_chat'));
  const selectedService = services.find(s => s.id === selectedServiceId);
  const messages = selectedService ? chatHistory[selectedService.id] || [] : [];

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
      const chatCapability = selectedService.capabilities.find(c => c.capability === 'llm_chat') as LlmChatCapability | undefined;
      if (!chatCapability) throw new Error('LLM chat capability not found for this service.');

      const chatEndpoint = chatCapability.endpoints.chat;
      if (!chatEndpoint) throw new Error('Chat endpoint not defined for this service');

      const currentHistory = useServiceStore.getState().chatHistory[selectedService.id] || [];
      // This is a simplified payload. We are not including other parameters for now.
      const payload = {
        model: 'default', // Assuming a default model, this could be improved
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

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <Toaster />
      <header className="p-2 border-b border-gray-700">
        <h1 className="text-lg font-bold">Kai-CD Agent</h1>
        <div className="mt-2">
          <select 
            value={selectedServiceId || ''}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a service...</option>
            {llmServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {selectedServiceId ? (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-2 p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
             {isLoading && (
              <div className="mb-2 p-2 rounded-lg bg-gray-700 mr-auto max-w-[80%]">
                <p className="text-sm">Thinking...</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select a service to start chatting.</p>
          </div>
        )}
      </main>
      <footer className="p-2 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !selectedServiceId}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 rounded-r-md hover:bg-blue-700 disabled:bg-gray-500" 
            disabled={isLoading || !selectedServiceId}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Sidepanel; 
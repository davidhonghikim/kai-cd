import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useServiceStore, type Service, type StreamedMessage } from '../../store/serviceStore';
import { apiClient } from '../../utils/apiClient';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';
import { AdjustmentsHorizontalIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ModelSelector from './ModelSelector';
import ParameterControl from './ParameterControl';
import type { LlmChatCapability, ParameterDefinition, ChatMessage } from '../../types';

interface LlmChatViewProps {
  service: Service;
  capability: LlmChatCapability;
}

const LlmChatView: React.FC<LlmChatViewProps> = ({ service, capability }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { updateServiceLastUsedModel } = useServiceStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [formState, setFormState] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    capability.parameters.chat.forEach(param => {
      if (param.key === 'model' && service.lastUsedModel) {
        initialState[param.key] = service.lastUsedModel;
      } else {
        initialState[param.key] = param.defaultValue;
      }
    });
    return initialState;
  });

  const handleParameterChange = (key: string, value: any) => {
    setFormState(prevState => ({ ...prevState, [key]: value }));
    if (key === 'model') {
      updateServiceLastUsedModel(service.id, value);
    }
  };

  const handleStreamedResponse = async (stream: AsyncGenerator<string>, assistantMessageId: string) => {
    try {
      for await (const chunk of stream) {
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            if (line.startsWith('data:')) {
              const jsonStr = line.substring(5).trim();
              if (jsonStr === '[DONE]') {
                return;
              }
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices[0]?.delta?.content;
              if (delta) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + delta }
                    : msg
                ));
              }
            }
          } catch (jsonError) {
            console.error('Error parsing stream chunk JSON:', jsonError, 'Chunk:', line);
          }
        }
      }
    } finally {
        setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !service) return;

    abortControllerRef.current = new AbortController();
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true }]);

    try {
      const chatEndpoint = capability.endpoints.chat;
      if (!chatEndpoint) throw new Error('Chat endpoint not defined for this service');

      const apiHistory = newMessages.map(({ role, content }) => ({ role, content }));
      const payload = { ...formState, messages: apiHistory, stream: true };
      
      const stream = apiClient.postStream(
        service.url,
        chatEndpoint.path,
        payload,
        service.authentication,
        abortControllerRef.current.signal
      );
      await handleStreamedResponse(stream, assistantMessageId);

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        toast.success('Request stopped');
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? {...msg, content: msg.content + ' [Stopped]', isStreaming: false} : msg));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? {...msg, content: `Sorry, I encountered an error: ${errorMessage}`, isStreaming: false} : msg));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    toast.success('Chat history cleared.');
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900">
      <div className="flex-1 flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <ModelSelector
            service={service}
            capability={capability}
            selectedModel={formState.model}
            onModelChange={(model) => handleParameterChange('model', model)}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Clear History"
            >
              <TrashIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Toggle Parameters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            </button>
          </div>
        </header>
        <ChatMessageList messages={messages} isLoading={isLoading} />
        <ChatInputForm 
            input={input} 
            setInput={setInput} 
            isLoading={isLoading} 
            handleSubmit={handleSubmit}
            stopRequest={() => abortControllerRef.current?.abort()}
        />
      </div>
      
      {/* Sidebar for parameters */}
      <aside 
        className={`
          transition-transform transform duration-300 ease-in-out
          fixed top-0 right-0 h-full w-80 z-50
          bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700
          md:relative md:translate-x-0 md:z-auto md:h-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Chat Parameters</h4>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-md md:hidden hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Close Parameters"
                >
                    <XMarkIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                {capability.parameters.chat.map((param: ParameterDefinition) => (
                !['messages', 'stream', 'model'].includes(param.key) && (
                    <ParameterControl
                    key={param.key}
                    param={param}
                    value={formState[param.key]}
                    onChange={handleParameterChange}
                    />
                )
                ))}
            </div>
        </div>
      </aside>

      {/* Overlay for smaller screens when sidebar is open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        ></div>
      )}
    </div>
  );
};

export default LlmChatView; 
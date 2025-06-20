import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useServiceStore, type Service } from '../../store/serviceStore';
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
  const { addMessageToHistory, updateServiceLastUsedModel } = useServiceStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  
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

  const handleStreamedResponse = async (stream: AsyncGenerator<string>) => {
    let finalContent = '';
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
                finalContent += delta;
                setStreamingMessage(prev => prev ? { ...prev, content: prev.content + delta } : null);
              }
            }
          } catch (jsonError) {
            console.error('Error parsing stream chunk JSON:', jsonError, 'Chunk:', line);
          }
        }
      }
    } finally {
      if (finalContent) {
        addMessageToHistory(service.id, { role: 'assistant', content: finalContent });
      }
      setStreamingMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !service) return;

    abortControllerRef.current = new AbortController();
    const userMessage: ChatMessage = { role: 'user', content: input };
    addMessageToHistory(service.id, userMessage);
    
    setInput('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = { role: 'assistant', content: ''};
    setStreamingMessage(assistantMessage);

    try {
      const chatEndpoint = capability.endpoints.chat;
      if (!chatEndpoint) throw new Error('Chat endpoint not defined for this service');

      const apiHistory = [...(service.history || []), userMessage].map(({ role, content }) => ({ role, content }));
      const payload = { ...formState, messages: apiHistory, stream: true };
      
      const stream = apiClient.postStream(
        service.url,
        chatEndpoint.path,
        payload,
        service.authentication,
        abortControllerRef.current.signal
      );
      await handleStreamedResponse(stream);

    } catch (error) {
      const finalContent = streamingMessage ? streamingMessage.content : '';
      if ((error as Error).name === 'AbortError') {
        toast.success('Request stopped');
        if (finalContent) {
           addMessageToHistory(service.id, { role: 'assistant', content: finalContent + ' [Stopped]'});
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`Error: ${errorMessage}`);
        if (finalContent) {
            addMessageToHistory(service.id, { role: 'assistant', content: `${finalContent}\n\nSorry, I encountered an error: ${errorMessage}`});
        } else {
            addMessageToHistory(service.id, { role: 'assistant', content: `Sorry, I encountered an error: ${errorMessage}`});
        }
      }
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    const { updateService } = useServiceStore.getState();
    updateService({ ...service, history: [] });
    toast.success('Chat history cleared.');
  };

  const messagesWithStream = service.history ? [...service.history] : [];
  if (streamingMessage) {
    messagesWithStream.push(streamingMessage);
  }

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100">
      <div className="flex-1 flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
          <ModelSelector
            service={service}
            capability={capability}
            selectedModel={formState.model}
            onModelChange={(model) => handleParameterChange('model', model)}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-md hover:bg-slate-700"
              title="Clear History"
            >
              <TrashIcon className="h-5 w-5 text-slate-400" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-700"
              title="Toggle Parameters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </header>
        <ChatMessageList service={service} />
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
          bg-slate-800 border-l border-slate-700
          md:relative md:translate-x-0 md:z-auto md:h-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-100">Chat Parameters</h4>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-md md:hidden hover:bg-slate-700"
                    title="Close Parameters"
                >
                    <XMarkIcon className="h-5 w-5 text-slate-300" />
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
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useServiceStore, type Service } from '../../store/serviceStore';
import { useViewStateStore } from '../../store/viewStateStore';
import { apiClient } from '../../utils/apiClient';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';
import { AdjustmentsHorizontalIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ParameterControl from './ParameterControl';
import type { LlmChatCapability, ParameterDefinition, ChatMessage } from '../../types';
import { ApiError } from '../../utils/apiClient';
import { logger } from '../../utils/logger';

interface LlmChatViewProps {
  service: Service;
  capability: LlmChatCapability;
}

const LlmChatView: React.FC<LlmChatViewProps> = ({ service, capability }) => {
  const { addMessageToHistory } = useServiceStore();
  const { 
    activeModel, 
    chatParameters, 
    setChatParameter,
    initializeChatParameters
  } = useViewStateStore();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // When the view mounts or the service/capability changes,
    // initialize the parameters in the central store.
    initializeChatParameters(capability);
  }, [service.id, capability, initializeChatParameters]);

  const handleStreamedResponse = async (stream: AsyncGenerator<string>) => {
    let finalContent = '';
    try {
      for await (const chunk of stream) {
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            let jsonStr = line;
            if (line.startsWith('data: ')) {
              jsonStr = line.substring(6);
            }
            
            if (jsonStr.trim() === '[DONE]') {
              return; // End of stream for some providers
            }

            const parsed = JSON.parse(jsonStr);
            
            // This handles both Ollama's format (e.g., `parsed.message.content`)
            // and OpenAI's format (e.g., `parsed.choices[0].delta.content`)
            const delta = parsed.choices?.[0]?.delta?.content ?? parsed.message?.content;

            if (delta) {
              finalContent += delta;
              setStreamingMessage(prev => prev ? { ...prev, content: prev.content + delta } : null);
            }
          } catch (jsonError) {
            logger.warn('Error parsing stream chunk JSON:', { error: jsonError, chunk: line });
          }
        }
      }
    } finally {
      if (finalContent) {
        addMessageToHistory(service.id, { 
          role: 'assistant', 
          content: finalContent,
          timestamp: Date.now()
        });
      }
      setStreamingMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !service || !activeModel) {
        toast.error("Cannot send message: A model must be selected.");
        return;
    };

    abortControllerRef.current = new AbortController();
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    addMessageToHistory(service.id, userMessage);
    
    setInput('');

    const assistantMessage: ChatMessage = { 
      role: 'assistant', 
      content: '',
      timestamp: Date.now()
    };
    setStreamingMessage(assistantMessage);

    try {
      const chatEndpoint = capability.endpoints.chat;
      if (!chatEndpoint) throw new Error('Chat endpoint not defined for this service');

      const apiHistory = [...(service.history || []), userMessage].map(({ role, content }) => ({ role, content }));
      
      // Ensure we have proper parameters with defaults
      const finalParams = { ...chatParameters };
      if (!finalParams.model) {
        finalParams.model = activeModel;
      }
      
      const payload = { 
        ...finalParams, 
        model: activeModel,
        messages: apiHistory, 
        stream: true 
      };
      
      logger.debug('[LlmChatView] PRE-API-CALL: Sending payload:', { serviceId: service.id, payload: payload });
      console.log('[LlmChatView] Chat Parameters:', chatParameters);
      console.log('[LlmChatView] Active Model:', activeModel);
      console.log('[LlmChatView] Final Payload:', payload);

      const stream = apiClient.postStream(
        service.id,
        chatEndpoint.path,
        payload,
        abortControllerRef.current.signal
      );
      await handleStreamedResponse(stream);

    } catch (error: any) {
      if (error instanceof ApiError) {
        // The toast is already shown by the apiClient for stream errors, so we just log it.
        logger.error('Chat submission failed', { code: error.code, message: error.message });
      } else if ((error as Error).name === 'AbortError') {
        toast.success('Request stopped');
        addMessageToHistory(service.id, { 
          role: 'assistant', 
          content: (streamingMessage?.content || '') + ' [Stopped]',
          timestamp: Date.now()
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(`An unexpected error occurred: ${errorMessage}`);
        logger.error('Unexpected chat error', { error });
      }
    } finally {
      setStreamingMessage(null);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = () => {
    const { updateService } = useServiceStore.getState();
    updateService({ ...service, history: [] });
    toast.success('Chat history cleared.');
  };

  return (
    <div className="relative h-full w-full bg-slate-950 text-slate-100 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-end p-2 border-b border-slate-700 bg-slate-800">
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
        <ChatMessageList service={service} streamingMessage={streamingMessage} />
        <ChatInputForm 
            input={input} 
            setInput={setInput} 
            isLoading={!!streamingMessage} 
            handleSubmit={handleSubmit}
            stopRequest={() => abortControllerRef.current?.abort()}
        />
      </div>
      
      {/* Sidebar for parameters */}
      <div className={`
        absolute top-0 right-0 h-full w-80 z-50
        transition-transform transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <aside 
          className="bg-slate-800 border-l border-slate-700 h-full w-full"
        >
          <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-100">Chat Parameters</h4>
                  <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 rounded-md hover:bg-slate-700"
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
                        value={chatParameters[param.key]}
                        onChange={(key, value) => setChatParameter(key, value)}
                      />
                  )
                  ))}
              </div>
          </div>
        </aside>
      </div>

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
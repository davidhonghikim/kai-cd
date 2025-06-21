import React, { useEffect, useRef, useState } from 'react';
import type { Service, ChatMessage } from '../../types';
import { UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageListProps {
  service: Service;
  streamingMessage: ChatMessage | null;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ service, streamingMessage }) => {
  const messages = service.history || [];
  const allMessages = streamingMessage ? [...messages, streamingMessage] : messages;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Sort messages by timestamp if available, otherwise maintain order
  const sortedMessages = allMessages.map((msg, index) => ({
    ...msg,
    timestamp: msg.timestamp || Date.now() - (allMessages.length - index) * 1000
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [sortedMessages.length, streamingMessage?.content, shouldAutoScroll]);

  // Handle user scroll behavior
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10; // 10px tolerance
    
    if (isAtBottom) {
      setUserHasScrolledUp(false);
      setShouldAutoScroll(true);
    } else {
      setUserHasScrolledUp(true);
      setShouldAutoScroll(false);
    }
  };

  // Reset auto-scroll when switching services or starting new conversation
  useEffect(() => {
    setUserHasScrolledUp(false);
    setShouldAutoScroll(true);
  }, [service.id]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <CpuChipIcon className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Start a conversation</h3>
            <p className="text-slate-500 max-w-md">
              Ask me anything! I'm here to help with questions, creative tasks, analysis, and more.
            </p>
          </div>
        ) : (
          sortedMessages.map((msg, index) => (
            <MessageBubble 
              key={`${msg.timestamp}-${index}`} 
              message={msg} 
              isStreaming={msg === streamingMessage}
            />
          ))
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {userHasScrolledUp && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            setUserHasScrolledUp(false);
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          }}
          className="fixed bottom-20 right-8 bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const Icon = isUser ? UserCircleIcon : CpuChipIcon;
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-start gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-cyan-600' : 'bg-slate-700'
        }`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-sm font-medium text-slate-300">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-slate-500">
              {formatTime(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`relative ${isUser ? 'ml-12' : 'mr-12'}`}>
          <div className={`
            rounded-2xl px-4 py-3 
            ${isUser 
              ? 'bg-cyan-600 text-white rounded-br-md' 
              : 'bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700'
            }
            ${isStreaming ? 'animate-pulse' : ''}
          `}>
            {message.content ? (
              <div className={`prose prose-sm max-w-none ${
                isUser 
                  ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-cyan-100 prose-code:bg-cyan-700' 
                  : 'prose-invert prose-p:text-slate-100 prose-headings:text-slate-100 prose-code:text-slate-200 prose-code:bg-slate-700'
              }`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center space-x-2 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-slate-400 ml-2">Thinking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageList;
import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/solid';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const Message = ({ msg }: { msg: ChatMessage }) => {
    const isUser = msg.role === 'user';
    const Icon = isUser ? UserIcon : CpuChipIcon;

    return (
      <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-white'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-0.5">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose dark:prose-invert max-w-none"
            components={{
              // Add custom components for code blocks, etc. if needed
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map(msg => <Message key={msg.id} msg={msg} />)}
      {isLoading && (
         <div className="flex items-start gap-4 p-4 bg-slate-100 dark:bg-slate-800">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-600 text-white">
            <CpuChipIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 pt-1.5">
            <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList; 
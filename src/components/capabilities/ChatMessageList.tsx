import React from 'react';
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {allMessages.map((msg, index) => (
        <MessageRow key={index} message={msg} />
      ))}
    </div>
  );
};

const MessageRow: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const Icon = isUser ? UserCircleIcon : CpuChipIcon;
  const bgColor = isUser ? 'bg-slate-800' : 'bg-transparent';
  const name = isUser ? 'You' : 'Assistant';

  return (
    <div className={`flex items-start space-x-4 p-4 rounded-lg ${bgColor}`}>
      <Icon className="h-8 w-8 text-slate-400 mt-1" />
      <div className="flex-1">
        <p className="font-bold text-slate-300">{name}</p>
        <div className="prose prose-invert prose-p:text-slate-200 prose-p:leading-relaxed">
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400">
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageList; 
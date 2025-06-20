import React from 'react';
import type { Service } from '../../types';
import { UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';

interface ChatMessageListProps {
  service: Service;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ service }) => {
  const messages = service.history || [];

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <CpuChipIcon className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold">{service.name}</h2>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
          {msg.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-cyan-400" />
            </div>
          )}
          <div
            className={`max-w-xl px-4 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
           {msg.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatMessageList; 
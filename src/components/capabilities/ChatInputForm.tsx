import React, { useRef } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';

interface ChatInputFormProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  stopRequest: () => void;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({ input, setInput, isLoading, handleSubmit, stopRequest }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (isLoading) return;
    handleSubmit(e);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
    >
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="w-full h-24 p-3 pr-12 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow resize-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !input.trim()}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInputForm; 
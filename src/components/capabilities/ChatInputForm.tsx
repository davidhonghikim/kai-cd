import React, { useRef } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';

interface ChatInputFormProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  stopRequest?: () => void;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({ 
  input, 
  setInput, 
  isLoading, 
  handleSubmit, 
  stopRequest 
}) => {
  const _inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleStop = () => {
    if (stopRequest) {
      stopRequest();
    }
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-900">
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="w-full h-20 p-4 pr-16 bg-slate-800 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            {isLoading && stopRequest && (
              <button
                type="button"
                onClick={handleStop}
                className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Stop generation"
              >
                <StopIcon className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || !input.trim()}
              title={isLoading ? "Generating response..." : "Send message"}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInputForm; 
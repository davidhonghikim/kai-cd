import React from 'react';
import { useServices } from '../hooks/useServices';

const Sidepanel = () => {
  const { services } = useServices();

  const llmServices = services.filter(s => s.type === 'ollama' || s.type === 'openai-compatible' || s.type === 'open-webui');

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      <header className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold">Kai-CD Agent</h1>
        <div className="mt-2">
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>Select a Model...</option>
            {llmServices.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Chat messages will go here */}
        <div className="flex flex-col space-y-2">
            <div className="p-3 rounded-lg bg-blue-500 text-white self-end">Hello!</div>
            <div className="p-3 rounded-lg bg-gray-200 text-gray-800 self-start">Hi there!</div>
        </div>
      </main>
      <footer className="p-4 bg-white border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Sidepanel; 
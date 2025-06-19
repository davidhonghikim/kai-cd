import React from 'react';
import { useLogStore } from '../store/logStore';

const ConsoleLogView: React.FC = () => {
  const { logs, clearLogs } = useLogStore();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white font-mono text-sm">
      <header className="flex-shrink-0 p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Console Logs</h2>
        <button
          onClick={clearLogs}
          className="px-3 py-1 text-xs rounded-md bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Clear Logs
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-2">
            <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className={`font-bold ${getLevelColor(log.level)}`}>[{log.level.toUpperCase()}]</span>
            <span className="flex-1 whitespace-pre-wrap">
              {log.message}
              {log.args.length > 0 && 
                <span className="text-gray-500 ml-2">
                  {log.args.map(arg => JSON.stringify(arg, null, 2)).join(' ')}
                </span>
              }
            </span>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ConsoleLogView; 
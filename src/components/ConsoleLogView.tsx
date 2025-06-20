import React, { useState, useMemo, useRef } from 'react';
import { useLogStore, type LogEntry, type LogLevel } from '../store/logStore';
import { useSettingsStore } from '../store/settingsStore';
import { TrashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { ApiError } from '../utils/apiClient';

const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 border-red-400';
      case 'WARN': return 'text-yellow-400 border-yellow-400';
      case 'INFO': return 'text-blue-400 border-blue-400';
      case 'DEBUG': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
};

const LogLevelIndicator: React.FC<{ level: LogLevel }> = ({ level }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getLevelColor(level)}`}>
        {level}
    </span>
);

const LogEntryDetails: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Check for our custom ApiError structure in the context
    const apiError = entry.context?.error as (ApiError | undefined);
    const hasApiError = apiError && apiError.errorInfo;

    const renderMessage = () => {
        if (hasApiError) {
            return (
                <span className="flex-1 whitespace-pre-wrap">
                    <span className="font-semibold text-red-300 mr-2">[{apiError.code}]</span>
                    {apiError.errorInfo.message}
                    <a 
                        href={`./docs.html?page=12_Issues_Troubleshooting--md#${apiError.errorInfo.doc_slug.substring(1)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 ml-2 underline"
                    >
                        Learn More
                    </a>
                </span>
            );
        }
        return <span className="flex-1 whitespace-pre-wrap cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>{entry.message}</span>;
    };

    const renderDetails = () => {
        if (!isExpanded) return null;
        let contentToShow = entry.context;
        if (hasApiError) {
            contentToShow = {
                details: apiError.errorInfo.details,
                raw_error: apiError.message, // The original technical message
            };
        }
        if (!contentToShow || Object.keys(contentToShow).length === 0) return null;

        return (
            <pre className="mt-2 p-2 bg-slate-800 rounded-md text-xs text-slate-300 overflow-x-auto">
                {JSON.stringify(contentToShow, null, 2)}
            </pre>
        );
    };

    return (
        <div className="flex-1">
            {renderMessage()}
            <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
                 {renderDetails()}
            </div>
        </div>
    );
};

const ConsoleLogView: React.FC = () => {
  const { logs, clearLogs, setLogs } = useLogStore();
  const { logLevel, setLogLevel } = useSettingsStore();
  const [filterText, setFilterText] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const textMatch = filterText ? log.message.toLowerCase().includes(filterText.toLowerCase()) : true;
      return textMatch;
    });
  }, [logs, filterText]);
  
  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kai-cd-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLogs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedLogs)) { // Basic validation
          setLogs(importedLogs);
          alert('Logs imported successfully!');
        } else {
          alert('Invalid file format.');
        }
      } catch (_error) {
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if(event.target) event.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white font-mono text-sm">
      <header className="flex-shrink-0 p-3 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-100">Console Logs</h2>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="log-level-select" className="text-xs font-semibold text-slate-400">Log Level:</label>
                <select
                    id="log-level-select"
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value as LogLevel)}
                    className="bg-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="DEBUG">Debug</option>
                    <option value="INFO">Info</option>
                    <option value="WARN">Warn</option>
                    <option value="ERROR">Error</option>
                </select>
            </div>
             <input
                type="text"
                placeholder="Filter logs..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-slate-700 rounded-md px-3 py-1 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>
        <div className="flex items-center gap-2">
            <input type="file" ref={importFileRef} onChange={handleImport} className="hidden" accept=".json" />
            <button onClick={() => importFileRef.current?.click()} className="p-2 rounded-md hover:bg-slate-700" title="Import Logs">
                <DocumentArrowUpIcon className="h-5 w-5 text-slate-300" />
            </button>
            <button onClick={handleExport} className="p-2 rounded-md hover:bg-slate-700" title="Export Logs">
                <DocumentArrowDownIcon className="h-5 w-5 text-slate-300" />
            </button>
            <button onClick={clearLogs} className="p-2 rounded-md hover:bg-slate-700" title="Clear Logs">
                <TrashIcon className="h-5 w-5 text-slate-300" />
            </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex items-start gap-3">
            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            <LogLevelIndicator level={log.level} />
            <LogEntryDetails entry={log} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default ConsoleLogView; 
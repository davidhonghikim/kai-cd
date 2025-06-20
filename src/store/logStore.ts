console.log('[LOG_STORE] Starting logStore module initialization...');

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { chromeStorage } from './chromeStorage';
import { v4 as uuidv4 } from 'uuid';

console.log('[LOG_STORE] All imports completed successfully');

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: number;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>; // For structured context
}

interface LogState {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, context?: Record<string, any>) => void;
  clearLogs: () => void;
  setLogs: (logs: LogEntry[]) => void; // For importing logs
}

const LOG_LIMIT = 1000; // Keep a maximum of 1000 log entries
let logId = 0;

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (level, message, context) => {
    const newEntry: LogEntry = {
      id: logId++,
      timestamp: Date.now(),
      level,
      message,
      context,
    };
    set((state) => ({
      logs: [...state.logs, newEntry].slice(-LOG_LIMIT), // Add new log and slice to enforce limit
    }));
  },
  clearLogs: () => set({ logs: [] }),
  setLogs: (logs) => set({ logs: logs.slice(-LOG_LIMIT) }),
})); 
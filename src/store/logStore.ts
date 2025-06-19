import { create } from 'zustand';

export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface LogEntry {
  id: number;
  timestamp: number;
  level: LogLevel;
  message: string;
  args: any[];
}

interface LogState {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, args: any[]) => void;
  clearLogs: () => void;
}

let logId = 0;

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (level, message, args) => {
    const newEntry: LogEntry = {
      id: logId++,
      timestamp: Date.now(),
      level,
      message,
      args,
    };
    set((state) => ({ logs: [...state.logs, newEntry] }));
  },
  clearLogs: () => set({ logs: [] }),
})); 
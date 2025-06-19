import { useLogStore } from '../store/logStore';

// Keep a reference to the original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

function getTimestamp(): string {
  // Use a simple time format for the console
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const customLogger = (level: LogLevel, ...args: any[]) => {
  const messageString = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');

  // Add to the in-app console log store
  useLogStore.getState().addLog(level, messageString, args);

  // Also output to the browser's native console
  originalConsole[level](`[${getTimestamp()}]`, ...args);
};

export const logger = {
  log: (...args: any[]) => customLogger('log', ...args),
  warn: (...args: any[]) => customLogger('warn', ...args),
  error: (...args: any[]) => customLogger('error', ...args),
  info: (...args: any[]) => customLogger('info', ...args),
  debug: (...args: any[]) => customLogger('debug', ...args),
};

// Optional: Override the global console object to capture all logs
export function overrideGlobalConsole() {
  console.log = logger.log;
  console.warn = logger.warn;
  console.error = logger.error;
  console.info = logger.info;
  console.debug = logger.debug;

  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error:', event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
  });
} 
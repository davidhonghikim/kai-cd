import { useLogStore, type LogLevel } from '../store/logStore';

// Keep a reference to the original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

/**
 * Overrides the default console methods to also store logs in our Zustand store.
 * This should be called once when the application initializes.
 */
export function initializeInAppLogger() {
  const override = (level: LogLevel) => {
    console[level] = (message: string, ...args: any[]) => {
      // Call the original console method so logs still appear in the browser console
      originalConsole[level](message, ...args);

      // Add the log to our in-app store
      useLogStore.getState().addLog(level, message, args);
    };
  };

  override('log');
  override('warn');
  override('error');
  override('info');
  override('debug');
} 
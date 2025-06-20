console.log('[LOGGER] Starting logger module initialization...');

import { useLogStore } from '../store/logStore';
import { type LogLevel } from '../store/settingsStore';
import { config } from '../config/env';

console.log('[LOGGER] All imports completed successfully');

// Keep a reference to the original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

const _LOG_LEVEL_MAP: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const customLogger = (level: LogLevel, message: string, context?: Record<string, any>) => {
  try {
    // DO NOT filter logs for now. We need to see everything.
    // if (!config.logging.enabled) {
    //   return;
    // }
    // const currentLogLevel = useSettingsStore.getState().logLevel;
    // if (LOG_LEVEL_MAP[level] < LOG_LEVEL_MAP[currentLogLevel]) {
    //   return;
    // }

    // Pass the raw context (which can be undefined) to the store. This is safe.
    useLogStore.getState().addLog(level, message, context);
    
    // For console logging, safely stringify the context.
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let consoleContext: any = '';
    if (context) {
        try {
            // We only stringify for the browser console view.
            consoleContext = JSON.parse(JSON.stringify(context, null, 2));
        } catch (_e) {
            // If it fails (e.g., circular reference), log the raw object.
            consoleContext = context;
        }
    }

    originalConsole[level.toLowerCase() as 'log'](`[${timestamp}] [${level}] ${message}`, consoleContext);
  
  } catch (logError) {
      originalConsole.error('--- LOGGER FAILURE ---');
      originalConsole.error(logError);
      originalConsole.error('Original message:', message);
      originalConsole.error('Original context:', context);
      originalConsole.error('--- END LOGGER FAILURE ---');
  }
};

const formatArgs = (args: any[]): { message: string, context: Record<string, any> | undefined } => {
    const context: Record<string, any> = {};
    let contextIndex = 0;

    const messageParts = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            const key = `context_${contextIndex++}`;
            context[key] = arg;
            return `[${key}]`; // Placeholder for the object
        }
        return String(arg);
    });

    return { 
        message: messageParts.join(' '), 
        context: Object.keys(context).length > 0 ? context : undefined
    };
};

export const logger = {
  debug: (...args: any[]) => {
    const { message, context } = formatArgs(args);
    customLogger('DEBUG', message, context);
  },
  info: (...args: any[]) => {
    const { message, context } = formatArgs(args);
    customLogger('INFO', message, context);
  },
  warn: (...args: any[]) => {
    const { message, context } = formatArgs(args);
    customLogger('WARN', message, context);
  },
  error: (...args: any[]) => {
    const { message, context } = formatArgs(args);
    customLogger('ERROR', message, context);
  },
};

// Optional: Override the global console object to capture all logs
export function overrideGlobalConsole() {
  if (!config.logging.enabled) {
    return;
  }
  console.log = logger.debug; // Default console.log to DEBUG level
  console.info = logger.info;
  console.warn = logger.warn;
  console.error = logger.error;
  console.debug = logger.debug;

  // Handle uncaught exceptions and unhandled promise rejections
  // Only set up window event listeners if we're in a window context (not service worker)
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection:', event.reason);
    });
  }
  // Note: Service worker error handling would be added here if needed in the future
} 
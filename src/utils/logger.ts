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

    if (consoleContext && Object.keys(consoleContext).length > 0) {
        originalConsole[level.toLowerCase() as 'log'](`[${timestamp}] [${level}] ${message}`, consoleContext);
    } else {
        originalConsole[level.toLowerCase() as 'log'](`[${timestamp}] [${level}] ${message}`);
    }
  
  } catch (logError) {
      originalConsole.error('--- LOGGER FAILURE ---');
      originalConsole.error(logError);
      originalConsole.error('Original message:', message);
      originalConsole.error('Original context:', context);
      originalConsole.error('--- END LOGGER FAILURE ---');
  }
};

const getObjectInfo = (obj: any): string => {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) return `Array(${obj.length})`;
    
    const constructor = obj.constructor?.name || 'Object';
    const keys = Object.keys(obj);
    
    // For common objects, show more specific info
    if (constructor === 'Object' && keys.length > 0) {
        const keyPreview = keys.slice(0, 3).join(', ');
        const moreKeys = keys.length > 3 ? `, +${keys.length - 3} more` : '';
        return `{${keyPreview}${moreKeys}}`;
    }
    
    // For class instances, show constructor and key count
    if (constructor !== 'Object') {
        return `${constructor}(${keys.length} props)`;
    }
    
    return constructor;
};

const formatArgs = (args: any[]): { message: string, context: Record<string, any> | undefined } => {
    const context: Record<string, any> = {};
    let contextIndex = 0;

    const messageParts = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            const key = `context_${contextIndex++}`;
            
            // Handle Error objects specifically
            if (arg instanceof Error) {
                context[key] = {
                    name: arg.name,
                    message: arg.message,
                    stack: arg.stack
                };
                return `[${key}] ${arg.name}: ${arg.message}`; // Show error info in message
            }
            
            // Handle other objects
            try {
                // Try to serialize the object to check if it's serializable
                JSON.stringify(arg);
                context[key] = arg;
                
                // For simple objects with basic values, show them inline
                const keys = Object.keys(arg);
                if (keys.length <= 3 && keys.every(k => 
                    typeof arg[k] === 'string' || 
                    typeof arg[k] === 'number' || 
                    typeof arg[k] === 'boolean' ||
                    arg[k] === null || 
                    arg[k] === undefined
                )) {
                    const values = keys.map(k => `${k}: ${arg[k]}`).join(', ');
                    return `{${values}}`;
                }
                
                // Show meaningful info about the object in the message
                const objectInfo = getObjectInfo(arg);
                return `[${key}] ${objectInfo}`;
            } catch (_e) {
                // For non-serializable objects, extract meaningful info
                const objectInfo = {
                    type: Object.prototype.toString.call(arg),
                    constructor: arg.constructor?.name || 'Unknown',
                    keys: Object.keys(arg).slice(0, 10) // First 10 keys
                };
                context[key] = objectInfo;
                return `[${key}] ${objectInfo.constructor}`;
            }
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
import { SERVICE_TYPES } from './constants';

// Base API endpoints for each service type
export const SERVICE_ENDPOINTS = {
  // LLM Service Endpoints
  [SERVICE_TYPES.OLLAMA]: {
    CHAT: '/api/chat',
    MODELS: '/api/tags',
    GENERATE: '/api/generate',
    EMBEDDINGS: '/api/embeddings',
    PULL: '/api/pull',
    CREATE: '/api/create',
    SHOW: '/api/show',
  },
  
  [SERVICE_TYPES.OPEN_WEBUI]: {
    BASE: '/api/v1',
    CHAT: '/chat',
    MODELS: '/models',
    PROVIDERS: '/providers',
    CONFIG: '/config',
  },
  
  [SERVICE_TYPES.A1111]: {
    TXT2IMG: '/sdapi/v1/txt2img',
    IMG2IMG: '/sdapi/v1/img2img',
    SAMPLERS: '/sdapi/v1/samplers',
    UPSCALERS: '/sdapi/v1/upscalers',
    SD_MODELS: '/sdapi/v1/sd-models',
    HYPERNETWORKS: '/sdapi/v1/hypernetworks',
    FACE_RESTORERS: '/sdapi/v1/face-restorers',
    REALESRGAN_MODELS: '/sdapi/v1/realesrgan-models',
    PROGRESS: '/sdapi/v1/progress',
    OPTIONS: '/sdapi/v1/options',
    CMD_FLAGS: '/sdapi/v1/cmd-flags',
  },
  
  [SERVICE_TYPES.COMFY_UI]: {
    VIEW: '/view',
    HISTORY: '/history',
    UPLOAD_IMAGE: '/upload/image',
    UPLOAD_MASK: '/upload/mask',
    VIEW_IMAGE: '/view',
    QUEUE: '/queue',
    QUEUE_PROMPT: '/prompt',
    HISTORY_ALL: '/history',
    HISTORY_ITEM: '/history/{prompt_id}',
    SYSTEM_STATS: '/system_stats',
  },
  
  [SERVICE_TYPES.LLAMA_CPP]: {
    COMPLETION: '/completion',
    CHAT: '/chat/completions',
    EMBEDDING: '/embeddings',
    TOKENIZE: '/tokenize',
    DETOKENIZE: '/detokenize',
  },
  
  [SERVICE_TYPES.VLLM]: {
    COMPLETION: '/completions',
    CHAT: '/chat/completions',
    EMBEDDING: '/embeddings',
    MODELS: '/models',
  },
  
  [SERVICE_TYPES.LLM_STUDIO]: {
    COMPLETION: '/completions',
    CHAT: '/chat/completions',
    EMBEDDING: '/embeddings',
    MODELS: '/models',
  },
  
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: {
    CHAT: '/chat/completions',
    COMPLETION: '/completions',
    EMBEDDING: '/embeddings',
    MODELS: '/models',
  },
} as const;

// Helper function to build full endpoint URLs
export const buildEndpoint = (
  serviceType: string,
  endpointKey: string,
  baseUrl: string = '',
  params: Record<string, string | number> = {}
): string => {
  const endpoints = SERVICE_ENDPOINTS[serviceType as keyof typeof SERVICE_ENDPOINTS];
  if (!endpoints) {
    throw new Error(`No endpoints defined for service type: ${serviceType}`);
  }
  
  const endpoint = endpoints[endpointKey as keyof typeof endpoints];
  if (typeof endpoint !== 'string') {
    throw new Error(`Invalid endpoint key: ${endpointKey} for service type: ${serviceType}`);
  }
  
  // Replace path parameters
  let processedEndpoint = endpoint as string;
  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    processedEndpoint = processedEndpoint.replace(regex, String(value));
  });
  
  // Ensure base URL ends with a single slash
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl || '';
  
  // Ensure endpoint starts with a single slash
  const normalizedEndpoint = processedEndpoint.startsWith('/') ? processedEndpoint : `/${processedEndpoint}`;
  
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
};

// Common API Headers
export const getDefaultHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  return headers;
};

// Default request options
export const DEFAULT_REQUEST_OPTIONS: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  cache: 'no-cache',
  credentials: 'same-origin',
  mode: 'cors',
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
};

// Service Types
export const SERVICE_TYPES = {
  UI_SERVICE: 'ui-service',
  IMAGE_GEN: 'image-gen',
  OLLAMA: 'ollama',
  OPEN_WEBUI: 'open-webui',
  A1111: 'a1111',
  COMFY_UI: 'comfy-ui',
  VLLM: 'vllm',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  LLAMA_CPP: 'llama-cpp',
  LLM_STUDIO: 'llm-studio',
  OPENAI_COMPATIBLE: 'openai-compatible',
  N8N: 'n8n',
  TAILSCALE: 'tailscale',
  CUSTOM: 'custom'
} as const;

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];

// Service Categories
export const SERVICE_CATEGORIES = {
  LLM: 'LLM',
  IMAGE_GENERATION: 'Image Generation',
  AUTOMATION: 'Automation',
  NETWORK: 'Network',
  UI: 'UI',
  CUSTOM: 'Custom'
} as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];

// Service Type to Category Mapping
export const SERVICE_TYPE_TO_CATEGORY: Record<typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES]> = {
  [SERVICE_TYPES.UI_SERVICE]: SERVICE_CATEGORIES.UI,
  [SERVICE_TYPES.IMAGE_GEN]: SERVICE_CATEGORIES.IMAGE_GENERATION,
  [SERVICE_TYPES.OLLAMA]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.OPEN_WEBUI]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.A1111]: SERVICE_CATEGORIES.IMAGE_GENERATION,
  [SERVICE_TYPES.COMFY_UI]: SERVICE_CATEGORIES.IMAGE_GENERATION,
  [SERVICE_TYPES.VLLM]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.OPENAI]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.ANTHROPIC]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.LLAMA_CPP]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.LLM_STUDIO]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: SERVICE_CATEGORIES.LLM,
  [SERVICE_TYPES.N8N]: SERVICE_CATEGORIES.AUTOMATION,
  [SERVICE_TYPES.TAILSCALE]: SERVICE_CATEGORIES.NETWORK,
  [SERVICE_TYPES.CUSTOM]: SERVICE_CATEGORIES.CUSTOM
};

// Default Ports
export const SERVICE_DEFAULT_PORTS: Record<typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], number> = {
  [SERVICE_TYPES.OLLAMA]: 11434,
  [SERVICE_TYPES.OPEN_WEBUI]: 3000,
  [SERVICE_TYPES.A1111]: 7860,
  [SERVICE_TYPES.COMFY_UI]: 8188,
  [SERVICE_TYPES.LLAMA_CPP]: 8080,
  [SERVICE_TYPES.VLLM]: 8000,
  [SERVICE_TYPES.LLM_STUDIO]: 1234,
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: 443,
  [SERVICE_TYPES.N8N]: 5678,
  [SERVICE_TYPES.TAILSCALE]: 5040,
  [SERVICE_TYPES.UI_SERVICE]: 3000,
  [SERVICE_TYPES.IMAGE_GEN]: 7860,
  [SERVICE_TYPES.OPENAI]: 443,
  [SERVICE_TYPES.ANTHROPIC]: 443,
  [SERVICE_TYPES.CUSTOM]: 0
};

// Default Base Paths
export const SERVICE_API_PATHS: Record<typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES], string> = {
  [SERVICE_TYPES.OLLAMA]: '',
  [SERVICE_TYPES.OPEN_WEBUI]: '',
  [SERVICE_TYPES.A1111]: '',
  [SERVICE_TYPES.COMFY_UI]: '',
  [SERVICE_TYPES.LLAMA_CPP]: '/v1',
  [SERVICE_TYPES.VLLM]: '/v1',
  [SERVICE_TYPES.LLM_STUDIO]: '/v1',
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: '/v1',
  [SERVICE_TYPES.N8N]: '/api',
  [SERVICE_TYPES.TAILSCALE]: '/api',
  [SERVICE_TYPES.UI_SERVICE]: '',
  [SERVICE_TYPES.IMAGE_GEN]: '',
  [SERVICE_TYPES.OPENAI]: '/v1',
  [SERVICE_TYPES.ANTHROPIC]: '/v1',
  [SERVICE_TYPES.CUSTOM]: ''
};

// Service Display Names
export const SERVICE_DISPLAY_NAMES = {
  [SERVICE_TYPES.OLLAMA]: 'Ollama',
  [SERVICE_TYPES.N8N]: 'n8n',
  [SERVICE_TYPES.TAILSCALE]: 'Tailscale',
  [SERVICE_TYPES.OPEN_WEBUI]: 'Open WebUI',
  [SERVICE_TYPES.A1111]: 'Automatic1111',
  [SERVICE_TYPES.COMFY_UI]: 'ComfyUI',
  [SERVICE_TYPES.LLAMA_CPP]: 'Llama.cpp',
  [SERVICE_TYPES.VLLM]: 'vLLM',
  [SERVICE_TYPES.LLM_STUDIO]: 'LLM Studio',
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: 'OpenAI Compatible'
} as const;

// Service Icons
export const SERVICE_ICONS = {
  [SERVICE_TYPES.OLLAMA]: '🦙',
  [SERVICE_TYPES.OPEN_WEBUI]: '🌐',
  [SERVICE_TYPES.A1111]: '🎨',
  [SERVICE_TYPES.COMFY_UI]: '🎛️',
  [SERVICE_TYPES.LLAMA_CPP]: '🦙',
  [SERVICE_TYPES.VLLM]: '⚡',
  [SERVICE_TYPES.LLM_STUDIO]: '🎓',
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: '🔌',
  [SERVICE_TYPES.N8N]: '🔄',
  [SERVICE_TYPES.TAILSCALE]: '🔒',
  [SERVICE_TYPES.UI_SERVICE]: '💻',
  [SERVICE_TYPES.IMAGE_GEN]: '🎨'
} as const;

export const DEFAULT_HOST = '192.168.1.180';

// Default Service URLs
export const getDefaultServiceUrl = (type: ServiceType, host: string = DEFAULT_HOST): string => {
  const port = SERVICE_DEFAULT_PORTS[type];
  const path = SERVICE_API_PATHS[type];
  return `http://${host}:${port}${path}`;
};

// Default Services Configuration
export const DEFAULT_SERVICES: Array<{
  name: string;
  type: ServiceType;
  url: string;
  apiKey?: string;
}> = [
  // Local Services
  {
    name: 'Ollama (Local)',
    type: SERVICE_TYPES.OLLAMA,
    url: getDefaultServiceUrl(SERVICE_TYPES.OLLAMA, 'localhost')
  },
  {
    name: 'OpenWebUI (Local)',
    type: SERVICE_TYPES.OPEN_WEBUI,
    url: getDefaultServiceUrl(SERVICE_TYPES.OPEN_WEBUI, 'localhost')
  },
  {
    name: 'A1111 (Local)',
    type: SERVICE_TYPES.A1111,
    url: getDefaultServiceUrl(SERVICE_TYPES.A1111, 'localhost')
  },
  {
    name: 'ComfyUI (Local)',
    type: SERVICE_TYPES.COMFY_UI,
    url: getDefaultServiceUrl(SERVICE_TYPES.COMFY_UI, 'localhost')
  },
  // Remote Services
  {
    name: 'Ollama (Remote)',
    type: SERVICE_TYPES.OLLAMA,
    url: getDefaultServiceUrl(SERVICE_TYPES.OLLAMA, DEFAULT_HOST)
  },
  {
    name: 'OpenWebUI (Remote)',
    type: SERVICE_TYPES.OPEN_WEBUI,
    url: getDefaultServiceUrl(SERVICE_TYPES.OPEN_WEBUI, DEFAULT_HOST)
  },
  {
    name: 'A1111 (Remote)',
    type: SERVICE_TYPES.A1111,
    url: getDefaultServiceUrl(SERVICE_TYPES.A1111, DEFAULT_HOST)
  },
  {
    name: 'ComfyUI (Remote)',
    type: SERVICE_TYPES.COMFY_UI,
    url: getDefaultServiceUrl(SERVICE_TYPES.COMFY_UI, DEFAULT_HOST)
  },
  // Other
  {
    name: 'OpenAI Compatible',
    type: SERVICE_TYPES.OPENAI_COMPATIBLE,
    url: 'https://api.openai.com/v1',
    apiKey: ''
  }
];

export const HEALTH_CHECK_PATHS: Partial<Record<ServiceType, string>> = {
  [SERVICE_TYPES.N8N]: '/healthz',
  [SERVICE_TYPES.OLLAMA]: '/api/tags',
  [SERVICE_TYPES.A1111]: '/sdapi/v1/progress',
  [SERVICE_TYPES.COMFY_UI]: '/'
};

export const DEFAULT_PORTS: Record<ServiceType, number> = {
  'ui-service': 3000,
  'image-gen': 7860,
  'ollama': 11434,
  'open-webui': 3000,
  'a1111': 7860,
  'comfy-ui': 8188,
  'vllm': 8000,
  'openai': 443,
  'anthropic': 443,
  'llama-cpp': 8080,
  'llm-studio': 1234,
  'openai-compatible': 443,
  'n8n': 5678,
  'tailscale': 443,
  'custom': 0
} as const;

export const DEFAULT_PATHS: Record<ServiceType, string> = {
  'ui-service': '',
  'image-gen': '',
  'ollama': '',
  'open-webui': '',
  'a1111': '',
  'comfy-ui': '',
  'vllm': '/v1',
  'openai': '/v1',
  'anthropic': '/v1',
  'llama-cpp': '/v1',
  'llm-studio': '/v1',
  'openai-compatible': '/v1',
  'n8n': '',
  'tailscale': '',
  'custom': ''
} as const;

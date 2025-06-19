import { 
  SERVICE_TYPES, 
  SERVICE_CATEGORIES, 
  SERVICE_DISPLAY_NAMES,
  SERVICE_ICONS,
  SERVICE_TYPE_TO_CATEGORY,
  type ServiceType,
  type ServiceCategory
} from './constants';

type ServiceMetadataMap = Record<ServiceType, ServiceMetadata>;

export const SERVICE_ICONS_WITH_NEW = SERVICE_ICONS;

// Service metadata and configuration
export interface ServiceMetadata {
  id: string;
  name: string;
  type: ServiceType;
  category: ServiceCategory;
  description: string;
  icon: string;
  requiresApiKey: boolean;
  supportsStreaming: boolean;
  supportsTemplates: boolean;
  defaultPort: number;
  defaultPath: string;
  defaultHeaders?: Record<string, string>;
  features: string[];
}

// Special service metadata
const SPECIAL_SERVICE_METADATA: Partial<ServiceMetadataMap> = {
  [SERVICE_TYPES.UI_SERVICE]: {
    id: SERVICE_TYPES.UI_SERVICE,
    name: 'UI Service',
    type: SERVICE_TYPES.UI_SERVICE,
    category: SERVICE_CATEGORIES.UI,
    description: 'Internal UI service for the application',
    icon: 'web',
    requiresApiKey: false,
    supportsStreaming: false,
    supportsTemplates: false,
    defaultPort: 0,
    defaultPath: '',
    features: ['UI rendering', 'User interface']
  },
  [SERVICE_TYPES.IMAGE_GEN]: {
    id: SERVICE_TYPES.IMAGE_GEN,
    name: 'Image Generation',
    type: SERVICE_TYPES.IMAGE_GEN,
    category: SERVICE_CATEGORIES.IMAGE_GENERATION,
    description: 'Image generation service',
    icon: 'image',
    requiresApiKey: false,
    supportsStreaming: false,
    supportsTemplates: false,
    defaultPort: 0,
    defaultPath: '',
    features: ['Image generation', 'AI art']
  }
} as const;

// Regular service metadata
const REGULAR_SERVICE_METADATA: Partial<ServiceMetadataMap> = {
  [SERVICE_TYPES.OLLAMA]: {
    id: SERVICE_TYPES.OLLAMA,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.OLLAMA],
    type: SERVICE_TYPES.OLLAMA,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.OLLAMA],
    description: 'Run large language models locally with Ollama',
    icon: SERVICE_ICONS[SERVICE_TYPES.OLLAMA],
    requiresApiKey: false,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 11434,
    defaultPath: '',
    features: [
      'Local model inference',
      'Model management',
      'Streaming responses',
      'Embedding generation'
    ]
  },
  
  [SERVICE_TYPES.OPEN_WEBUI]: {
    id: SERVICE_TYPES.OPEN_WEBUI,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.OPEN_WEBUI],
    type: SERVICE_TYPES.OPEN_WEBUI,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.OPEN_WEBUI],
    description: 'Web-based interface for interacting with LLMs',
    icon: SERVICE_ICONS[SERVICE_TYPES.OPEN_WEBUI],
    requiresApiKey: false,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 3000,
    defaultPath: '/api/v1',
    features: [
      'Web-based chat interface',
      'Multiple model support',
      'Conversation history',
      'User management'
    ]
  },

  [SERVICE_TYPES.N8N]: {
    id: SERVICE_TYPES.N8N,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.N8N],
    type: SERVICE_TYPES.N8N,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.N8N],
    description: 'Workflow automation platform with a wide range of integrations',
    icon: SERVICE_ICONS_WITH_NEW[SERVICE_TYPES.N8N],
    requiresApiKey: true,
    supportsStreaming: false,
    supportsTemplates: false,
    defaultPort: 5678,
    defaultPath: '',
    features: [
      'Workflow automation',
      'Webhook support',
      'Integration with 200+ services',
      'Visual workflow builder'
    ]
  },

  [SERVICE_TYPES.TAILSCALE]: {
    id: SERVICE_TYPES.TAILSCALE,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.TAILSCALE],
    type: SERVICE_TYPES.TAILSCALE,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.TAILSCALE],
    description: 'Zero-config VPN for secure access to devices and services',
    icon: SERVICE_ICONS_WITH_NEW[SERVICE_TYPES.TAILSCALE],
    requiresApiKey: true,
    supportsStreaming: false,
    supportsTemplates: false,
    defaultPort: 8080,
    defaultPath: '/api/v2',
    features: [
      'Secure remote access',
      'Device management',
      'Network monitoring',
      'ACL controls'
    ]
  },
  
  [SERVICE_TYPES.A1111]: {
    id: SERVICE_TYPES.A1111,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.A1111],
    type: SERVICE_TYPES.A1111,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.A1111],
    description: 'Stable Diffusion web UI with a feature-rich interface',
    icon: SERVICE_ICONS[SERVICE_TYPES.A1111],
    requiresApiKey: false,
    supportsStreaming: false,
    supportsTemplates: false,
    defaultPort: 7860,
    defaultPath: '',
    features: [
      'Text-to-image generation',
      'Image-to-image',
      'Inpainting',
      'Upscaling',
      'Model management'
    ]
  },
  
  [SERVICE_TYPES.COMFY_UI]: {
    id: SERVICE_TYPES.COMFY_UI,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.COMFY_UI],
    type: SERVICE_TYPES.COMFY_UI,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.COMFY_UI],
    description: 'Node-based UI for Stable Diffusion with advanced workflows',
    icon: SERVICE_ICONS[SERVICE_TYPES.COMFY_UI],
    requiresApiKey: false,
    supportsStreaming: false,
    supportsTemplates: true,
    defaultPort: 8188,
    defaultPath: '',
    features: [
      'Node-based workflow editor',
      'Custom workflows',
      'Batch processing',
      'Model management'
    ]
  },
  
  [SERVICE_TYPES.LLAMA_CPP]: {
    id: SERVICE_TYPES.LLAMA_CPP,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.LLAMA_CPP],
    type: SERVICE_TYPES.LLAMA_CPP,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.LLAMA_CPP],
    description: 'LLaMA model inference in C/C++',
    icon: SERVICE_ICONS[SERVICE_TYPES.LLAMA_CPP],
    requiresApiKey: false,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 8080,
    defaultPath: '/v1',
    features: [
      'High-performance inference',
      'Multiple model formats',
      'OpenAI-compatible API',
      'GPU acceleration'
    ]
  },
  
  [SERVICE_TYPES.VLLM]: {
    id: SERVICE_TYPES.VLLM,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.VLLM],
    type: SERVICE_TYPES.VLLM,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.VLLM],
    description: 'High-throughput and memory-efficient LLM serving',
    icon: SERVICE_ICONS[SERVICE_TYPES.VLLM],
    requiresApiKey: false,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 8000,
    defaultPath: '/v1',
    features: [
      'Continuous batching',
      'PagedAttention',
      'OpenAI-compatible API',
      'Multi-GPU support'
    ]
  },
  
  [SERVICE_TYPES.LLM_STUDIO]: {
    id: SERVICE_TYPES.LLM_STUDIO,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.LLM_STUDIO],
    type: SERVICE_TYPES.LLM_STUDIO,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.LLM_STUDIO],
    description: 'Fine-tune and serve LLMs with an easy-to-use interface',
    icon: SERVICE_ICONS[SERVICE_TYPES.LLM_STUDIO],
    requiresApiKey: false,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 1234,
    defaultPath: '/v1',
    features: [
      'Model fine-tuning',
      'Evaluation',
      'Deployment',
      'OpenAI-compatible API'
    ]
  },
  
  [SERVICE_TYPES.OPENAI_COMPATIBLE]: {
    id: SERVICE_TYPES.OPENAI_COMPATIBLE,
    name: SERVICE_DISPLAY_NAMES[SERVICE_TYPES.OPENAI_COMPATIBLE],
    type: SERVICE_TYPES.OPENAI_COMPATIBLE,
    category: SERVICE_TYPE_TO_CATEGORY[SERVICE_TYPES.OPENAI_COMPATIBLE],
    description: 'Any service with an OpenAI-compatible API',
    icon: SERVICE_ICONS[SERVICE_TYPES.OPENAI_COMPATIBLE],
    requiresApiKey: true,
    supportsStreaming: true,
    supportsTemplates: true,
    defaultPort: 443,
    defaultPath: '/v1',
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    features: [
      'Chat completions',
      'Text completions',
      'Embeddings',
      'Function calling',
      'Streaming'
    ]
  }
};

// Combine all service metadata
export const SERVICE_METADATA: ServiceMetadataMap = {
  ...Object.fromEntries(
    Object.entries(REGULAR_SERVICE_METADATA).filter(([_, v]) => v !== undefined)
  ),
  ...Object.fromEntries(
    Object.entries(SPECIAL_SERVICE_METADATA).filter(([_, v]) => v !== undefined)
  )
} as unknown as ServiceMetadataMap;

// Helper functions
export function getServiceMetadata(serviceType: ServiceType): ServiceMetadata {
  const metadata = SERVICE_METADATA[serviceType];
  if (!metadata) {
    throw new Error(`No metadata found for service type: ${serviceType}`);
  }
  return metadata;
};

export function getServicesByCategory(category: ServiceCategory): ServiceMetadata[] {
  return Object.values(SERVICE_METADATA).filter(
    (service): service is ServiceMetadata => service?.category === category
  );
}

export function getLLMServices(): ServiceMetadata[] {
  return getServicesByCategory(SERVICE_CATEGORIES.LLM);
}

export function getImageServices(): ServiceMetadata[] {
  return getServicesByCategory(SERVICE_CATEGORIES.IMAGE_GENERATION);
}

export const getUIServices = (): ServiceMetadata[] => {
  return getServicesByCategory(SERVICE_CATEGORIES.UI);
};

export const getAutomationServices = (): ServiceMetadata[] => {
  return getServicesByCategory(SERVICE_CATEGORIES.AUTOMATION);
};

export const getNetworkServices = (): ServiceMetadata[] => {
  return getServicesByCategory(SERVICE_CATEGORIES.NETWORK);
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Endpoint {
  path: string;
  method: HttpMethod;
}

export interface ServiceEndpointGroup {
  [endpointKey: string]: Endpoint;
}

export interface ServiceEndpoints {
  [serviceKey: string]: ServiceEndpointGroup;
}

export type ServiceType =
  | 'ollama'
  | 'open-webui'
  | 'a1111'
  | 'comfyui'
  | 'llama-cpp'
  | 'vllm'
  | 'llm-studio'
  | 'openai-compatible'
  | 'n8n'
  | 'milvus'
  | 'qdrant'
  | 'chroma'
  | 'huggingface'
  | 'civitai'
  | 'openai'
  | 'anthropic'
  | 'weaviate'
  | 'huginn'
  | 'node-red'
  | 'jellyfin'
  | 'tailscale'
  | 'dropbox';

// --- Parameter & Capability Definitions ---

export interface SelectOption {
  value: string;
  label: string;
}

export interface ParameterDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'file';
  multiple?: boolean;
  defaultValue: any;
  description: string;
  options?: (string | SelectOption)[];
  range?: [number, number];
  step?: number;
  optionsEndpoint?: string;
  optionsPath?: string;
  optionsValueKey?: string;
  optionsLabelKey?: string;
}

export interface ImageGenerationCapability {
  capability: 'image_generation';
  endpoints: {
    [endpointKey: string]: Endpoint;
  };
  parameters: {
    [parameterKey: string]: ParameterDefinition[];
  };
}

export interface LlmChatCapability {
  capability: 'llm_chat';
  endpoints: {
    chat: Endpoint;
    getModels?: Endpoint;
  };
  parameters: {
    chat: ParameterDefinition[];
  };
  models?: string[];
}

export interface ModelManagementCapability {
  capability: 'model_management';
  endpoints: {
    [endpointKey: string]: Endpoint;
  };
  parameters: {
    [parameterKey: string]: ParameterDefinition[];
  };
}

export interface AutomationCapability {
  capability: 'automation';
  endpoints: {
    [endpointKey: string]: Endpoint;
  };
  parameters: {
    [parameterKey: string]: ParameterDefinition[];
  };
}

export interface LangChainCapability {
  capability: 'langchain';
  roles: ('llm' | 'tool' | 'vectorstore' | 'memory')[];
}

export interface StorageCapability {
  capability: 'storage';
  endpoints: {
    [endpointKey: string]: Endpoint; // e.g., listFiles, uploadFile, downloadFile
  };
  parameters: {
    [parameterKey: string]: ParameterDefinition[]; // e.g., list, upload
  };
}

export interface VectorDatabaseCapability {
  capability: 'vector_database';
  endpoints: {
    listCollections: Endpoint;
    query: Endpoint;
    upsert: Endpoint;
    delete: Endpoint;
  };
  parameters: {
    query: ParameterDefinition[];
    upsert: ParameterDefinition[];
  };
}

export interface GraphExecutionCapability {
  capability: 'graph_execution';
  baseWorkflow: ComfyWorkflow;
  endpoints: {
    prompt: Endpoint;
    view: Endpoint;
    history: Endpoint;
    websocket: Endpoint;
  };
  parameterMapping: {
    [paramKey: string]: {
      nodeId: string;
      inputKey: string;
      parameterDefinition: ParameterDefinition;
    };
  };
}

export interface HealthCapability {
  capability: 'health';
  endpoints: {
    health: Endpoint;
  };
}

export type CapabilityType = 'llm_chat' | 'image_generation' | 'model_management' | 'automation' | 'langchain' | 'storage' | 'vector_database' | 'graph_execution' | 'health';

export type ServiceCapability =
  | LlmChatCapability
  | ImageGenerationCapability
  | ModelManagementCapability
  | AutomationCapability
  | LangChainCapability
  | StorageCapability
  | VectorDatabaseCapability
  | GraphExecutionCapability
  | HealthCapability;

// --- Authentication & Configuration ---

export type AuthType = 'none' | 'api_key' | 'bearer_token' | 'basic';
export type AuthDefinition =
  | { type: 'none' }
  | {
      type: 'api_key';
      keyName?: string;
      help?: string;
      credentials?: { apiKey: string };
    }
  | {
      type: 'bearer_token';
      credentials?: { [key: string]: string };
      help?: string;
    }
  | {
      type: 'basic';
      credentials?: { [key: string]: string };
      help?: string;
    };

export interface ServiceArgument {
  flag: string;
  description: string;
  required?: boolean;
}

// --- Main Service Definitions ---

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  category: string;
  defaultPort: number;
  hasExternalUi?: boolean;
  docs?: { [key: string]: string };
  authentication: AuthDefinition;
  headers?: { [key: string]: string };
  capabilities: ServiceCapability[];
  configuration?: {
    arguments?: { [key: string]: ServiceArgument };
    help?: { [key: string]: string };
  };
}

export type Service = ServiceDefinition & {
  id: string;
  url: string;
  enabled: boolean;
  status: 'online' | 'offline' | 'checking' | 'unknown';
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedModel?: string;
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface GeneratedImage {
  id: string;
  serviceId: string;
  imageData: string; // base64 encoded
  prompt: string;
  timestamp: number;
}

// --- Graph Execution (ComfyUI) Types ---
export interface ComfyNode {
  inputs: { [key: string]: any };
  class_type: string;
}

export interface ComfyWorkflow {
  [nodeId: string]: ComfyNode;
}

export interface LlmManagedService {
  // ... existing code ...
}

export interface CapabilityViewProps<T extends ServiceCapability> {
  service: Service;
  capability: T;
}

export interface ImageArtifact {
  id: string;
  // ... existing code ...
}
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
    [endpointKey: string]: Endpoint;
  };
  parameters: {
    chat: ParameterDefinition[];
  };
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

export type ServiceCapability =
  | LlmChatCapability
  | ImageGenerationCapability
  | ModelManagementCapability
  | AutomationCapability
  | LangChainCapability
  | StorageCapability
  | VectorDatabaseCapability
  | GraphExecutionCapability;

// --- Authentication & Configuration ---

export type AuthType = 'none' | 'api_key' | 'bearer_token' | 'basic';
export type AuthDefinition =
  | { type: 'none' }
  | {
      type: 'api_key';
      keyName?: string;
      help?: string;
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
  docs?: { [key: string]: string };
  authentication: AuthDefinition;
  headers?: { [key: string]: string };
  capabilities: ServiceCapability[];
  configuration?: {
    arguments?: { [key: string]: ServiceArgument };
    help?: { [key: string]: string };
  };
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  url: string;
  enabled: boolean;
  status: 'unknown' | 'online' | 'offline';
  category: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  isConnected: boolean;
  authentication: AuthDefinition;
  capabilities: ServiceCapability[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
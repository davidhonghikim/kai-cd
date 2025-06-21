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
  | 'dropbox'
  | 'reticulum';

export interface ImageGenerationCapability {
  capability: 'image_generation';
  endpoints: {
    [endpointKey: string]: Endpoint;
  };
  parameters: {
    [parameterKey: string]: ParameterDefinition[];
  };
}

export interface ModelManagementCapability {
  capability: 'model_management';
  endpoints: {
    getModels?: Endpoint;
    [key: string]: Endpoint | undefined;
  };
  parameters: {
    [key: string]: ParameterDefinition[];
  };
  responseMapping?: {
    [key: string]: {
      path: string;
      valueKey: string;
      labelKey: string;
    };
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

export interface MeshNetworkingCapability {
  capability: 'mesh_networking';
  endpoints: {
    getNodes: Endpoint;
    sendMessage: Endpoint;
    getMessages: Endpoint;
    announce: Endpoint;
    getDestinations: Endpoint;
  };
  parameters: {
    network: ParameterDefinition[];
  };
}

export type CapabilityType =
  | 'llm_chat'
  | 'image_generation'
  | 'model_management'
  | 'automation'
  | 'langchain'
  | 'storage'
  | 'vector_database'
  | 'graph_execution'
  | 'mesh_networking'
  | 'health';

export type ServiceCapability =
  | LlmChatCapability
  | ImageGenerationCapability
  | ModelManagementCapability
  | AutomationCapability
  | LangChainCapability
  | StorageCapability
  | VectorDatabaseCapability
  | GraphExecutionCapability
  | MeshNetworkingCapability
  | HealthCapability;

// --- Authentication, Credentials & Configuration ---

export type AuthType = 'none' | 'api_key' | 'bearer_token' | 'basic';

export interface Credential {
  id: string;
  name: string;
  type: AuthType;
  value: string; // This is the actual key/token, will be encrypted in the vault
}

export type AuthDefinition = {
  type: AuthType;
  help?: string;
  keyName?: string; // For api_key type
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
  serviceDefinitionId: ServiceType;
  ipType: 'local' | 'remote' | 'cloud' | 'custom';
  credentialId?: string;
  customUrl?: string;
  url: string; // This will be deprecated and removed
  enabled: boolean;
  status: 'unknown' | 'online' | 'offline' | 'error' | 'checking';
  lastChecked: number;
  lastUsedModel?: string;
  // For chat services, to store conversation history
  history?: ChatMessage[];
  imageHistory?: GeneratedImage[];  archived?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type NewService = {
  serviceDefinitionId: ServiceType;
  name: string;
  ipType: 'local' | 'remote' | 'cloud' | 'custom';
  credentialId?: string;
  customUrl?: string;
};


export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
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

// Placeholder type for future expansion; using generic record to satisfy eslint no-empty-interface rule.
export type LlmManagedService = Record<string, unknown>;

export interface CapabilityViewProps<T extends ServiceCapability> {
  service: Service;
  capability: T;
}

export interface ImageArtifact {
  id: string;
  // ... existing code ...
} 
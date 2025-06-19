import { ServiceType, ServiceCategory } from '@/config/constants';

export type { ServiceType, ServiceCategory };

export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  url: string;
  enabled: boolean;
  status: ServiceStatus;
  category: ServiceCategory;
  requiresApiKey: boolean;
  apiKey?: string;
  features?: string[];
  config?: ServiceConfig;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface ServiceConfig {
  id: string;
  name: string;
  type: ServiceType;
  url: string;
  enabled: boolean;
  status: 'active' | 'inactive';
  category: ServiceCategory;
  requiresApiKey: boolean;
  apiKey?: string;
  features?: string[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface LLMModel {
  id: string;
  name: string;
  description?: string;
  contextSize?: number;
  contextWindow?: number;
  format?: string;
  parameters?: {
    context_length?: number;
    [key: string]: any;
  };
  supportsChat?: boolean;
  supportsCompletion?: boolean;
  supportsEmbedding?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ImageModel extends LLMModel {
  type?: 'image' | 'checkpoint' | 'vae' | 'lora' | 'embedding' | 'hypernetwork';
  width?: number;
  height?: number;
  filename?: string;
  hash?: string;
  size?: number;
  metadata?: Record<string, unknown>;
  title?: string;
  author?: string;
  version?: string;
  tags?: string[];
}

export interface ImageGenOptions {
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  negativePrompt?: string;
  seed?: number;
}

export type ImageGenSampler = string;

export interface ComfyUIWorkflow {
  id: string;
  name: string;
  nodes: Record<string, any>;
  edges: Record<string, any>;
}

export interface ComfyUIWorkflowInput {
  nodeId: string;
  nodeTitle: string;
  inputId: string;
  inputName: string;
  inputType: string;
  value?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ImageArtifact {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  seed?: number;
  model?: string;
  parameters?: Record<string, any>;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    max_tokens?: number;
    stop?: string[];
  };
}

export interface CompletionRequest {
  model: string;
  prompt: string;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    max_tokens?: number;
    stop?: string[];
  };
}

export interface EmbeddingRequest {
  model: string;
  input: string;
}

export interface ChatCompletionResponse {
  message: ChatMessage;
}

export interface CompletionResponse {
  response: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}

export interface ModelsResponse {
  models: LLMModel[];
}

export interface ServiceFormData {
  name: string;
  type: ServiceType;
  url: string;
  endpoints?: {
    chat?: string;
    completion?: string;
    embedding?: string;
  } | string[];
  status?: 'active' | 'inactive';
  apiKey?: string;
  options?: Record<string, any>;
}

export interface ServiceResponse {
  success: boolean;
  service?: Service | null;
  services?: Service[];
  error?: string;
}

export interface ImageGenConnector {
  getModels(): Promise<ImageModel[]>;
  generateImage(prompt: string, options?: ImageGenOptions): Promise<Partial<ImageArtifact>>;
  getImageModels?(): Promise<ImageModel[]>;
}

export interface ChatConnector {
  sendMessage(message: string, options?: any): Promise<ChatMessage>;
  getModels(): Promise<LLMModel[]>;
  clearHistory(): Promise<void>;
  getHistory(): Promise<ChatSession[]>;
}

export type RequestHandler<T = unknown, R = unknown> = (
  payload: T,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: R) => void
) => Promise<void>;

export interface Prompt {
  id: string;
  name: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
  serviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface GenerationParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface StreamChunk {
  id: string;
  text: string;
  finishReason?: string;
} 
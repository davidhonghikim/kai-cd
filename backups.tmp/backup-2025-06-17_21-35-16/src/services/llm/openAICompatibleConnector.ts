import { BaseConnector } from '../base/BaseConnector';
import type { Service, ServiceConfig, ChatMessage, LLMModel, ChatCompletionRequest, ChatCompletionResponse, CompletionRequest, CompletionResponse, EmbeddingRequest, EmbeddingResponse, ModelsResponse } from '@/types';
import { getServiceMetadata } from '@/config/services';
import { ApiClient } from '@/utils/apiClient';
import { withErrorHandling } from '@/utils/errorHandling';

// Define StreamChunk interface locally since it's not exported from types
export interface StreamChunk {
  content?: string;
  isComplete: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

// OpenAI API response types
interface OpenAIResponse<T> {
  data: T;
}

interface OpenAIModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
}

interface OpenAIChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface OpenAICompletionResponse {
  choices: Array<{
    text: string;
  }>;
}

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

/**
 * Connector for services that implement the OpenAI-compatible API
 */
export class OpenAICompatibleConnector extends BaseConnector {
  protected _service: Service;
  private defaultHeaders: Record<string, string> = {};
  protected abortController: AbortController | null = null;
  private apiClient: ApiClient;

  constructor(config: ServiceConfig) {
    super(config);
    this._service = { ...config };
    this.defaultHeaders = this.getDefaultHeaders();
    const mergedConfig = { ...config };
    this.apiClient = new ApiClient({
      baseUrl: mergedConfig.url,
      apiKey: mergedConfig.apiKey,
    });
    // Set metadata using a method or directly if the base property is protected
    (this as any).metadata = getServiceMetadata(config.type);
  }

  // Implement the abstract fetch method from BaseConnector
  protected async fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string; response?: Response }> {
    try {
      this.abortController = new AbortController();
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...(options.headers || {})
        },
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const data = await response.json().catch(() => ({}));
      return { data, response };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Connect to the service
   */
  public async connect(): Promise<boolean> {
    return withErrorHandling(
      async () => {
        await this.apiClient.get('/v1/models');
        return true;
      },
      'Failed to connect to OpenAI-compatible service'
    );
  }

  /**
   * Disconnect from the service
   */
  public async disconnect(): Promise<void> {
    // This method is inherited from BaseConnector and should be implemented
  }

  /**
   * Get the service category
   */
  public getCategory(): string {
    return 'OpenAI Compatible';
  }

  /**
   * Get the default headers for API requests
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this._service.apiKey) {
      headers['Authorization'] = `Bearer ${this._service.apiKey}`;
    }

    return headers;
  }

  /**
   * Update headers when service configuration changes
   */
  public async updateService(service: Partial<Service>): Promise<void> {
    this._service = {
      ...this._service,
      ...service,
      id: this._service.id,
      type: service.type || this._service.type,
    };
    this.defaultHeaders = this.getDefaultHeaders();
    if (service.url || service.apiKey) {
      if (this.isConnected()) {
        await this.disconnect();
        await this.connect();
      }
    }
  }

  /**
   * Check if the service is reachable and return status information
   */
  public async checkStatus(): Promise<{ isOnline: boolean; details?: ServiceConfig; error?: string }> {
    try {
      const url = new URL('/v1/models', this._service.url).toString();
      const response = await this.fetch<{ data: OpenAIModel[] }>(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });
      
      if (!response.data) {
        throw new Error('No data received from models endpoint');
      }
      
      await this.getModels();
      
      // Return the service with updated models and model count
      return {
        isOnline: true,
        details: this._service as ServiceConfig
      };
    } catch (error) {
      return {
        isOnline: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of available models
   */
  public async getModels(): Promise<ModelsResponse> {
    const response = await withErrorHandling<OpenAIResponse<OpenAIModel[]>>(
      () => this.apiClient.get('/v1/models'),
      'Failed to fetch models'
    );

    return {
      models: response.data.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || '',
        format: 'openai',
        parameters: {
          context_length: model.context_length || 4096
        },
        contextWindow: model.context_length || 4096,
        supportsChat: true,
        supportsCompletion: true,
        supportsEmbedding: true
      }))
    };
  }

  /**
   * Send a chat message and get a response
   */
  public async chat(
    messages: Array<{
      role: 'user' | 'assistant' | 'system' | 'function';
      content: string;
      name?: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    }>,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      stop?: string[];
      stream?: boolean;
      onChunk?: (chunk: StreamChunk) => void;
    } = {}
  ): Promise<ChatMessage> {
    const { stream = false, onChunk, ...restOptions } = options;
    const url = new URL('/v1/chat/completions', this._service.url).toString();

    if (stream) {
      if (!onChunk) {
        throw new Error('onChunk is required for streaming');
      }
      return this.streamChatResponse(messages, model, restOptions, onChunk);
    }

    // Standard non-streaming request
    const response = await this.fetch<OpenAIChatCompletionResponse>(url, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        model,
        messages,
        temperature: restOptions.temperature,
        max_tokens: restOptions.maxTokens,
        top_p: restOptions.topP,
        frequency_penalty: restOptions.frequencyPenalty,
        presence_penalty: restOptions.presencePenalty,
        stop: restOptions.stop?.length ? restOptions.stop : undefined,
        stream: false,
      }),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to get chat completion');
    }

    const choice = response.data.choices[0];
    if (!choice) {
      throw new Error('No response from model');
    }

    const responseMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: choice.message.content,
      timestamp: Date.now(),
    };
    return responseMessage;
  }

  private async streamChatResponse(
    messages: Array<{
      role: 'user' | 'assistant' | 'system' | 'function';
      content: string;
      name?: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    }>,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
      stop?: string[];
    },
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<ChatMessage> {
    const url = new URL('/v1/chat/completions', this._service.url).toString();
    
    // Create a new AbortController for this request
    this.abortController = new AbortController();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop?.length ? options.stop : undefined,
          stream: true,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}\n${errorBody}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let isComplete = false;

      while (!isComplete) {
        const { done, value } = await reader.read();
        
        if (done) {
          isComplete = true;
          if (onChunk) {
            onChunk({ isComplete: true });
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line === 'data: [DONE]') {
            isComplete = true;
            if (onChunk) {
              onChunk({ isComplete: true });
            }
            continue;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              
              if (data.choices?.[0]?.delta?.content) {
                const chunkContent = data.choices[0].delta.content;
                content += chunkContent;
                
                if (onChunk) {
                  onChunk({
                    content: chunkContent,
                    isComplete: false,
                    metadata: {
                      ...data,
                      choices: undefined, // Remove large data
                    },
                  });
                }
              }
              
              // Check if this is the final chunk
              if (data.choices?.[0]?.finish_reason) {
                isComplete = true;
                if (onChunk) {
                  onChunk({ isComplete: true });
                }
              }
            } catch (error) {
              console.error('Error parsing stream chunk:', error);
              if (onChunk) {
                onChunk({
                  isComplete: true,
                  error: error instanceof Error ? error.message : 'Error parsing stream',
                });
              }
              throw error;
            }
          }
        }
      }

      const responseMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
      };
      return responseMessage;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel the current streaming request
   */
  public cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Generate embeddings for a list of texts
   */
  public async embed(
    texts: string[],
    model: string = 'text-embedding-ada-002'
  ): Promise<number[][]> {
    const url = new URL('/v1/embeddings', this._service.url).toString();
    
    const response = await this.fetch<OpenAIEmbeddingResponse>(url, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        input: texts.length === 1 ? texts[0] : texts,
        model,
      }),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to generate embeddings');
    }

    return response.data.data.map(item => item.embedding);
  }

  /**
   * Tokenize text
   */
  public async tokenize(text: string, model: string): Promise<number[]> {
    // Note: The standard OpenAI API doesn't have a direct tokenization endpoint
    // This is a best-effort implementation that might need to be adjusted
    // based on the specific API implementation
    const url = new URL('/v1/tokenize', this._service.url).toString();
    
    const response = await this.fetch<OpenAIEmbeddingResponse>(url, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        text,
        model,
      }),
    });

    if (!response.data) {
      // Fallback to approximate tokenization if the endpoint is not available
      return this.approximateTokenization(text);
    }

    return response.data.data[0].embedding;
  }

  /**
   * Approximate tokenization when the API doesn't provide a tokenize endpoint
   */
  private approximateTokenization(text: string): number[] {
    // This is a very rough approximation
    // In a real implementation, you might want to use a proper tokenizer
    const tokens: number[] = [];
    for (let i = 0; i < text.length; i++) {
      tokens.push(text.charCodeAt(i));
    }
    return tokens;
  }

  /**
   * Detokenize tokens back to text
   */
  public async detokenize(tokens: number[], model: string): Promise<string> {
    // Note: The standard OpenAI API doesn't have a direct detokenization endpoint
    // This is a best-effort implementation that might need to be adjusted
    const url = new URL('/v1/detokenize', this._service.url).toString();
    
    const response = await this.fetch<OpenAIEmbeddingResponse>(url, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        tokens,
        model,
      }),
    });

    if (!response.data) {
      // Fallback to approximate detokenization if the endpoint is not available
      return this.approximateDetokenization(tokens);
    }

    return response.data.data[0].embedding.map(Number).join('');
  }

  /**
   * Approximate detokenization when the API doesn't provide a detokenize endpoint
   */
  private approximateDetokenization(tokens: number[]): string {
    // This is a very rough approximation
    return String.fromCharCode(...tokens);
  }

  /**
   * Count tokens in a message or text
   */
  public async countTokens(
    input: string | { role: string; content: string; name?: string } | Array<{ role: string; content: string; name?: string }>,
    model: string
  ): Promise<number> {
    if (typeof input === 'string') {
      return this.tokenize(input, model).then((tokens) => tokens.length);
    } else if (Array.isArray(input)) {
      const tokens = await Promise.all(input.map((msg) => this.tokenize(msg.content, model)));
      return tokens.flat().length;
    } else {
      return this.tokenize(input.content, model).then((tokens) => tokens.length);
    }
  }

  /**
   * Get the context window size for a model
   */
  public async getContextSize(model: string): Promise<number> {
    // Try to get the context size from the model info
    try {
      const modelInfo = await this.getModel(model);
      if (modelInfo?.contextWindow) {
        return modelInfo.contextWindow;
      }
    } catch (error) {
      console.warn('Failed to get model info, using default context size', error);
    }

    // Default context size if model info is not available
    return 4096; // Default context size for most OpenAI models
  }

  public async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await withErrorHandling<OpenAIChatCompletionResponse>(
      () => this.apiClient.post('/v1/chat/completions', {
        model: request.model,
        messages: request.messages,
        ...request.options
      }),
      'Failed to generate chat completion'
    );

    return {
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: Date.now(),
      }
    };
  }

  public async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await withErrorHandling<OpenAICompletionResponse>(
      () => this.apiClient.post('/v1/completions', {
        model: request.model,
        prompt: request.prompt,
        ...request.options
      }),
      'Failed to generate completion'
    );

    return {
      response: response.choices[0].text
    };
  }

  public async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const response = await withErrorHandling<OpenAIEmbeddingResponse>(
      () => this.apiClient.post('/v1/embeddings', {
        model: request.model,
        input: request.input
      }),
      'Failed to generate embedding'
    );

    return {
      embedding: response.data[0].embedding
    };
  }

  /**
   * Get a single model by id
   */
  public async getModel(modelId: string): Promise<LLMModel | null> {
    const models = await this.getModels();
    const found = models.models.find((m: any) => (m.id || m.name) === modelId);
    if (!found) return null;
    // Map to LLMModel if needed
    return {
      id: 'id' in found && typeof (found as any).id === 'string' ? (found as any).id : found.name,
      name: found.name,
      description: found.description || '',
      format: 'openai',
      contextWindow: (found.parameters && found.parameters.context_length) || 4096,
      // Only include parameters if it's a number
      parameters: typeof found.parameters === 'number' ? found.parameters : undefined
    };
  }

  public isConnected(): boolean {
    return this.isConnected();
  }
}
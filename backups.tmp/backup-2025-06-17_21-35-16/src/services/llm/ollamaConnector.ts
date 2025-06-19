import { LLMConnector } from './LLMConnector';
import type { Service, ChatMessage, ChatCompletionRequest, CompletionRequest, EmbeddingRequest, ChatCompletionResponse, CompletionResponse, EmbeddingResponse, LLMModel, GenerationParams } from '@/types';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export class OllamaConnector extends LLMConnector {
  constructor(service: Service) {
    super(service as any);
  }

  async connect(): Promise<boolean> {
    // Try to fetch models as a connectivity check
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // Disconnect implementation
  }

  async checkStatus(): Promise<{ isOnline: boolean; details?: any; error?: string }> {
    try {
      await this.getModels();
      return { isOnline: true, details: this.service };
    } catch (error) {
      return { isOnline: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.service.url}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.service.apiKey ? { 'Authorization': `Bearer ${this.service.apiKey}` } : {})
    };
    return fetch(url, { ...options, headers });
  }

  async validateConfig(): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }> {
    try {
      const response = await this.fetchWithAuth('/api/tags');
      return { isValid: response.ok };
    } catch (error) {
      return { isValid: false, errors: ['Failed to connect to Ollama service'] };
    }
  }

  async getModelStatus(): Promise<Record<string, boolean>> {
    try {
      const response = await this.fetchWithAuth('/api/tags');
      const data = await response.json();
      const models = data.models || [];
      const status: Record<string, boolean> = {};
      models.forEach((model: OllamaModel) => {
        status[model.name] = true;
      });
      return status;
    } catch (error) {
      return {};
    }
  }

  public async getModels(): Promise<LLMModel[]> {
    try {
      const response = await this.fetchWithAuth('/api/tags');
      const data = await response.json();
      const models = data.models || [];
      return models.map((model: OllamaModel) => ({
        id: model.name,
        name: model.name,
        provider: 'ollama',
        contextLength: 4096,
        parameters: model.size
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  public async chat(messages: ChatMessage[], options: GenerationParams = {}): Promise<string> {
    const request: ChatCompletionRequest = {
      model: 'gemma3:1b',
      messages,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 40,
        max_tokens: options.maxTokens || 100,
        stop: options.stopSequences || []
      }
    };

    try {
      const response = await this.fetchWithAuth('/api/chat', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ChatCompletionResponse = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
    }
  }

  public async completion(prompt: string, options: GenerationParams = {}): Promise<string> {
    const request: CompletionRequest = {
      model: 'gemma3:1b',
      prompt,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        top_k: options.topK || 40,
        max_tokens: options.maxTokens || 100,
        stop: options.stopSequences || []
      }
    };

    try {
      const response = await this.fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CompletionResponse = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Error in completion:', error);
      throw error;
    }
  }

  public async embedding(text: string): Promise<number[]> {
    const request: EmbeddingRequest = {
      model: 'gemma3:1b',
      input: text
    };

    try {
      const response = await this.fetchWithAuth('/api/embeddings', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: EmbeddingResponse = await response.json();
      return data.embedding || [];
    } catch (error) {
      console.error('Error in embedding:', error);
      throw error;
    }
  }

  public async tokenize(_text: string): Promise<number[]> {
    // Placeholder implementation
    return [];
  }

  public async detokenize(_tokens: number[]): Promise<string> {
    // Placeholder implementation
    return '';
  }
} 
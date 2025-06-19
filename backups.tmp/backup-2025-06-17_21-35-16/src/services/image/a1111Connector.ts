import type { ImageModel, ImageGenOptions, ImageArtifact, ServiceConfig } from '@/types';
import type { ImageGenConnector } from '@/types';
import { BaseConnector } from '../base/BaseConnector';

export class A1111Connector extends BaseConnector<ServiceConfig> implements ImageGenConnector {
  constructor(service: ServiceConfig) {
    super(service);
  }

  private getApiUrl(endpoint: string): string {
    const baseUrl = this.service.url?.replace(/\/$/, '');
    return `${baseUrl}${endpoint}`;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.getApiUrl(endpoint);
    const headers = {
      'Content-Type': 'application/json',
      ...(this.service.apiKey ? { 'Authorization': `Bearer ${this.service.apiKey}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`A1111 API error: ${response.statusText}`);
    }

    return response;
  }

  async connect(): Promise<boolean> {
    // Implement connection logic if needed
    this._isConnected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    // Implement disconnect logic if needed
    this._isConnected = false;
  }

  async checkStatus(): Promise<{
    isOnline: boolean;
    details?: ServiceConfig;
    error?: string;
  }> {
    try {
      await this.fetchWithAuth('/sdapi/v1/sd-models');
      return { 
        isOnline: true, 
        details: this.service
      };
    } catch (error) {
      return { 
        isOnline: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getDisplayName(): string {
    return this.service.name;
  }

  getType(): string {
    return this.service.type;
  }

  getCategory(): string {
    return 'Stable Diffusion';
  }

  async updateService(service: Partial<ServiceConfig>): Promise<void> {
    await super.updateService(service);
    // Reconnect if connection details changed
    if (service.url || service.apiKey) {
      if (this.isConnected()) {
        await this.disconnect();
        await this.connect();
      }
    }
  }

  async validateConfig(): Promise<{
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    const baseValidation = await super.validateConfig();
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Add A1111-specific validation
    if (!this.service.url) {
      errors.push('Service URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  async getModels(): Promise<ImageModel[]> {
    const res = await this.fetchWithAuth('/sdapi/v1/sd-models');
    const models = await res.json();
    return models.map((model: any) => ({ 
      id: model.title,
      name: model.model_name,
      filename: model.filename,
      hash: model.hash,
    }));
  }

  async getSamplers(): Promise<{ name: string }[]> {
    const res = await this.fetchWithAuth('/sdapi/v1/samplers');
    const samplers = await res.json();
    return samplers.map((s: any) => ({ name: s.name }));
  }

  async getLoras(): Promise<ImageModel[]> {
    const res = await this.fetchWithAuth('/sdapi/v1/loras');
    const loras = await res.json();
    return loras.map((lora: any) => ({ id: lora.name, name: lora.name, filename: lora.path }));
  }

  async getEmbeddings(): Promise<ImageModel[]> {
    const res = await this.fetchWithAuth('/sdapi/v1/embeddings');
    const embeddings = await res.json();
    return Object.keys(embeddings.loaded).map(name => ({ id: name, name, filename: '' }));
  }

  async getImageModels(): Promise<ImageModel[]> {
    return this.getModels();
  }

  async generateImage(prompt: string, options?: ImageGenOptions): Promise<Partial<ImageArtifact>> {
    if (!this.service.url) {
      throw new Error('Service URL not configured');
    }
    const requestBody = {
      prompt,
      negative_prompt: options?.negativePrompt || '',
      steps: options?.steps || 20,
      width: options?.width || 512,
      height: options?.height || 512,
      cfg_scale: options?.cfgScale || 7,
      model: options?.model || '',
    };
    const response = await this.fetchWithAuth('/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      id: Date.now().toString(),
      url: '',
      prompt,
      timestamp: Date.now(),
      parameters: {
        negativePrompt: options?.negativePrompt,
        model: options?.model,
        width: options?.width,
        height: options?.height,
        steps: options?.steps,
        cfgScale: options?.cfgScale,
      }
    };
  }
}
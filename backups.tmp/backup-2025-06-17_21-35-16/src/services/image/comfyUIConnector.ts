import type { ImageGenConnector, ImageModel, ComfyUIWorkflowInput, ImageArtifact, ImageGenSampler, ServiceConfig } from '@/types';
import { BaseConnector } from '../base/BaseConnector';

export class ComfyUIConnector extends BaseConnector<ServiceConfig> implements ImageGenConnector {
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
      throw new Error(`ComfyUI API error: ${response.statusText}`);
    }

    return response;
  }

  async connect(): Promise<boolean> {
    return true;
  }

  async disconnect(): Promise<void> {
    // Implementation needed
  }

  async checkStatus(): Promise<{
    isOnline: boolean;
    details?: ServiceConfig;
    error?: string;
  }> {
    try {
      await this.fetchWithAuth('/history');
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

    // Add ComfyUI-specific validation
    if (!this.service.url) {
      errors.push('Service URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  parseWorkflow(workflowJson: string): ComfyUIWorkflowInput[] {
    const inputs: ComfyUIWorkflowInput[] = [];
    const workflow = JSON.parse(workflowJson);
    
    for (const node of workflow.nodes) {
      if (node.type === 'CLIPTextEncode') {
        inputs.push({ nodeId: node.id, nodeTitle: node.title, inputId: 'text', inputName: 'Prompt', inputType: 'text' });
      }
      if (node.type === 'KSampler') {
        inputs.push({ nodeId: node.id, nodeTitle: node.title, inputId: 'seed', inputName: 'Seed', inputType: 'number' });
        inputs.push({ nodeId: node.id, nodeTitle: node.title, inputId: 'steps', inputName: 'Steps', inputType: 'number' });
        inputs.push({ nodeId: node.id, nodeTitle: node.title, inputId: 'cfg', inputName: 'CFG Scale', inputType: 'number' });
      }
    }
    return inputs;
  }

  async executeWorkflow(workflowJson: string, inputs: Record<string, Record<string, any>>): Promise<string> {
    const workflow = JSON.parse(workflowJson);
    
    // Apply user inputs to the workflow
    for (const [nodeId, nodeInputs] of Object.entries(inputs)) {
      const node = workflow.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        for (const [inputId, value] of Object.entries(nodeInputs)) {
          if (node.inputs && node.inputs[inputId]) {
            node.inputs[inputId] = value;
          }
        }
      }
    }

    // Queue the workflow
    const response = await this.fetchWithAuth('/prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt: workflow }),
    });

    const { prompt_id } = await response.json();

    // Poll for completion
    while (true) {
      const statusResponse = await this.fetchWithAuth(`/history/${prompt_id}`);
      const status = await statusResponse.json();
      
      if (status.outputs && Object.keys(status.outputs).length > 0) {
        const output = Object.values(status.outputs)[0] as any;
        if (output.images && output.images.length > 0) {
          const image = output.images[0];
          return `data:image/png;base64,${image.data}`;
        }
      }

      if (status.status === 'error') {
        throw new Error('Workflow execution failed');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async generateImage(prompt: string): Promise<Partial<ImageArtifact>> {
    if (!this.service.url) {
      throw new Error('Service URL not configured');
    }

    // TODO: Implement ComfyUI workflow execution
    // For now, return a placeholder
    return {
      id: Date.now().toString(),
      url: '',
      prompt,
      timestamp: Date.now()
    };
  }

  async getModels(): Promise<ImageModel[]> {
    const res = await this.fetchWithAuth('/object_info');
    const data = await res.json();
    return Object.keys(data).map(name => ({ id: name, name, filename: '' }));
  }

  async getSamplers(): Promise<ImageGenSampler[]> {
    return Promise.resolve([]);
  }

  async getLoras(): Promise<ImageModel[]> {
    return Promise.resolve([]);
  }

  async getEmbeddings(): Promise<ImageModel[]> {
    return Promise.resolve([]);
  }

  getCategory(): string {
    return 'ComfyUI';
  }

  async updateService(service: Partial<ServiceConfig>): Promise<void> {
    await super.updateService(service);
    if (service.url || service.apiKey) {
      await this.disconnect();
      await this.connect();
    }
  }

  async getImageModels(): Promise<ImageModel[]> {
    return this.getModels();
  }
} 
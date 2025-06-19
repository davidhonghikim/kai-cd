import { BaseConnector } from '../base/BaseConnector';
import type { Service, ServiceConfig } from '@/types';

interface N8NService extends Service {
  apiKey?: string;
}

export class N8NConnector extends BaseConnector<ServiceConfig> {
  private baseUrl: string;
  protected _service: N8NService;

  constructor(service: N8NService) {
    super(service);
    this._service = service;
    this.baseUrl = service.url.endsWith('/') ? service.url.slice(0, -1) : service.url;
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      this._isConnected = response.ok;
      return this._isConnected;
    } catch (error) {
      console.error('Error connecting to n8n:', error);
      this._isConnected = false;
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    this._isConnected = false;
  }

  async checkStatus(): Promise<{ isOnline: boolean; details?: ServiceConfig; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      const isOnline = response.ok;
      return {
        isOnline,
        details: this._service as ServiceConfig
      };
    } catch (error) {
      return {
        isOnline: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: this._service as ServiceConfig
      };
    }
  }

  async getModels(): Promise<any[]> {
    // n8n doesn't have models in the same way as LLM services
    return [];
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this._service.apiKey && { 'Authorization': `Bearer ${this._service.apiKey}` })
    };
  }

  // Add any n8n-specific methods here
  async executeWorkflow(workflowId: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing n8n workflow:', error);
      throw error;
    }
  }
}

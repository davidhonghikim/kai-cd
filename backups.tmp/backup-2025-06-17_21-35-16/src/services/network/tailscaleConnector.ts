import { BaseConnector } from '../base/BaseConnector';
import type { ServiceConfig } from '@/types';

export class TailscaleConnector extends BaseConnector<ServiceConfig> {
  constructor(service: ServiceConfig) {
    super(service);
  }

  public async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.service.url}/api/v2/status`);
      const isConnected = response.ok;
      return isConnected;
    } catch (error) {
      console.error('Error connecting to Tailscale:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    // This method is not implemented in the original code or the new code
  }

  async checkStatus(): Promise<{ isOnline: boolean; details?: ServiceConfig; error?: string }> {
    try {
      const response = await fetch(`${this.service.url}/api/v2/status`);
      const isOnline = response.ok;
      return {
        isOnline,
        details: this.service as ServiceConfig
      };
    } catch (error) {
      return {
        isOnline: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: this.service as ServiceConfig
      };
    }
  }

  async getModels(): Promise<any[]> {
    // Tailscale doesn't have models in the same way as LLM services
    return [];
  }

  // Tailscale API methods
  async getDevices() {
    try {
      const response = await fetch(`${this.service.url}/api/v2/devices`, {
        headers: {
          'Authorization': `Bearer ${this.service.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting Tailscale devices:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  // Add more Tailscale API methods as needed
}

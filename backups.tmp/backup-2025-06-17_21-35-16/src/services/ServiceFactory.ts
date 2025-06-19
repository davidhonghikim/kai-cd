// Core imports
import { 
  SERVICE_TYPES, 
  type ServiceType,
  type ServiceCategory
} from "@/config/constants";
import { getServiceMetadata } from "@/config/services";
import type { ServiceConfig } from '@/types';

// Connector imports
import { BaseConnector } from './base/BaseConnector';
import { OllamaConnector } from './llm/ollamaConnector';
import { OpenAICompatibleConnector } from './llm/openAICompatibleConnector';
import { A1111Connector } from './image/a1111Connector';
import { ComfyUIConnector } from './image/comfyUIConnector';
import { N8NConnector } from './automation/n8nConnector';
import { TailscaleConnector } from './network/tailscaleConnector';

// Types
type Connector = BaseConnector<ServiceConfig>;

/**
 * Service Factory creates and manages service connectors based on service type
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private connectors: Map<string, Connector> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of ServiceFactory
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Get a service connector by service ID
   */
  public async getConnector(service: ServiceConfig): Promise<Connector | null> {
    const existingConnector = this.connectors.get(service.id);
    if (existingConnector) {
      return existingConnector;
    }

    const connector = await this.createConnector(service);
    if (connector) {
      this.connectors.set(service.id, connector);
    }
    return connector;
  }

  private async createConnector(service: ServiceConfig): Promise<Connector | null> {
    switch (service.type) {
      case SERVICE_TYPES.OLLAMA:
        return new OllamaConnector(service);
      case SERVICE_TYPES.OPENAI_COMPATIBLE:
        return new OpenAICompatibleConnector(service);
      case SERVICE_TYPES.A1111:
        return new A1111Connector(service);
      case SERVICE_TYPES.COMFY_UI:
        return new ComfyUIConnector(service);
      case SERVICE_TYPES.N8N:
        return new N8NConnector(service);
      case SERVICE_TYPES.TAILSCALE:
        return new TailscaleConnector(service);
      default:
        console.warn(`Unknown service type: ${service.type}`);
        return null;
    }
  }

  /**
   * Remove a connector from the cache
   */
  public removeConnector(id: string): void {
    this.connectors.delete(id);
  }

  /**
   * Get a connector by service ID
   */
  public getConnectorById(id: string): Connector | undefined {
    return this.connectors.get(id);
  }

  /**
   * Get all connectors
   */
  public getAllConnectors(): Connector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Check if a service type is supported
   */
  public isServiceTypeSupported(type: string): type is ServiceType {
    return Object.values(SERVICE_TYPES).includes(type as ServiceType);
  }

  /**
   * Get the category of a service type
   */
  public getServiceCategory(type: ServiceType): ServiceCategory {
    const metadata = getServiceMetadata(type);
    return metadata.category;
  }
}

// Export a singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Re-export connector interfaces and types
export * from './llm/LLMConnector';

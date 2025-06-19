/* global console */
import { serviceFactory } from '@/services/ServiceFactory';
import type { Service } from '@/types';
import type { IConnector } from "@/services/base/BaseConnector";

/**
 * Manages service connectors with caching and lifecycle management
 */
export class ConnectorManager {
  private static instance: ConnectorManager;
  private connectors: Map<string, IConnector> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of ConnectorManager
   */
  public static getInstance(): ConnectorManager {
    if (!ConnectorManager.instance) {
      ConnectorManager.instance = new ConnectorManager();
    }
    return ConnectorManager.instance;
  }

  /**
   * Get a connector for the given service, creating it if necessary
   */
  public async getConnector(service: Service): Promise<IConnector | null> {
    const cacheKey = service.id;
    
    if (this.connectors.has(cacheKey)) {
      return this.connectors.get(cacheKey) || null;
    }

    try {
      const connector = await serviceFactory.getConnector(service);
      if (connector) {
        this.connectors.set(cacheKey, connector);
        return connector;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get connector for service ${service.id}:`, error);
      throw error;
    }
  }

  /**
   * Remove a connector from the cache
   */
  public removeConnector(serviceId: string): void {
    const connector = this.connectors.get(serviceId);
    if (connector) {
      connector.disconnect().catch(console.error);
      this.connectors.delete(serviceId);
    }
  }

  /**
   * Clear all connectors and disconnect them
   */
  public async clearConnectors(): Promise<void> {
    const disconnectPromises = Array.from(this.connectors.values())
      .map(connector => connector.disconnect().catch(console.error));
    
    await Promise.all(disconnectPromises);
    this.connectors.clear();
  }

  /**
   * Get information about all active connectors
   */
  public getActiveConnectors() {
    return Array.from(this.connectors.entries()).map(([id, connector]) => {
      const isConnected = 'isConnected' in connector ? 
        (connector as any).isConnected : 
        (connector as any)._isConnected;
      const status = isConnected ? 'connected' : 'disconnected';
      return {
        id,
        type: connector.service.type,
        status,
        name: connector.service.name || 'Unnamed Service'
      };
    });
  }
}

export const connectorManager = ConnectorManager.getInstance();

import type { Service } from '@/types';
import type { IConnector } from "../../services/base/BaseConnector";

declare module "@/connectors" {
  export const connectorManager: {
    getInstance(): {
      getConnector(service: Service): Promise<IConnector | null>;
      getConnectorForService(serviceId: string): Promise<IConnector | null>;
      getConnectorForUrl(url: string): Promise<IConnector | null>;
      getAllConnectors(): Promise<IConnector[]>;
      removeConnector(serviceId: string): void;
      clearConnectors(): void;
    };
  };

  export default connectorManager;
}

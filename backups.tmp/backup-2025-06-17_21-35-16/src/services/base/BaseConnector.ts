import type { ServiceConfig } from '@/types';

/**
 * Base interface for all service connectors
 */
export interface IConnector<T = unknown> {
  /**
   * Unique identifier for the connector instance
   */
  readonly id: string;
  
  /**
   * The service configuration this connector is using
   */
  readonly service: ServiceConfig;
  
  /**
   * Connect to the service
   */
  connect(): Promise<boolean>;
  
  /**
   * Disconnect from the service
   */
  disconnect(): Promise<void>;
  
  /**
   * Check if the connector is currently connected
   */
  isConnected(): boolean;
  
  /**
   * Check the status of the service
   */
  checkStatus(): Promise<{
    isOnline: boolean;
    details?: T;
    error?: string;
  }>;
  
  /**
   * Get the display name of the connector
   */
  getDisplayName(): string;
  
  /**
   * Get the service type
   */
  getType(): string;
  
  /**
   * Get the service category
   */
  getCategory(): string;
  
  /**
   * Get the service metadata
   */
  getMetadata(): Record<string, unknown>;
  
  /**
   * Update the service configuration
   */
  updateService(service: Partial<ServiceConfig>): Promise<void>;
  
  /**
   * Validate the service configuration
   */
  validateConfig(): Promise<{
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }>;
}

/**
 * Base class for all service connectors
 */
export abstract class BaseConnector<T = any> implements IConnector<T> {
  public readonly id: string;
  public service: ServiceConfig;
  protected _isConnected: boolean = false;
  private metadata: Record<string, any> = {};
  
  constructor(service: ServiceConfig) {
    if (!service || !service.id) {
      throw new Error('Service must have an ID');
    }
    
    this.id = service.id;
    this.service = { ...service };
  }
  
  public abstract connect(): Promise<boolean>;
  public abstract disconnect(): Promise<void>;
  
  public abstract checkStatus(): Promise<{
    isOnline: boolean;
    details?: T;
    error?: string;
  }>;
  
  public getDisplayName(): string {
    return this.service.name;
  }
  
  public getType(): string {
    return this.service.type;
  }
  
  public getCategory(): string {
    return this.service.category;
  }
  
  public getMetadata(): Record<string, any> {
    return this.metadata;
  }
  
  public async updateService(service: Partial<ServiceConfig>): Promise<void> {
    this.service = {
      ...this.service,
      ...service,
      updatedAt: Date.now()
    };
  }
  
  public async validateConfig(): Promise<{
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!this.service.url) {
      errors.push('Service URL is required');
    }
    
    if (this.service.requiresApiKey && !this.service.apiKey) {
      errors.push('API key is required for this service');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
  
  /**
   * Helper method to make HTTP requests with consistent error handling
   */
  protected async fetch<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<{
    data?: T;
    error?: string;
    response?: Response;
  }> {
    try {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (this.service.apiKey) {
        requestHeaders['Authorization'] = `Bearer ${this.service.apiKey}`;
      }
      
      console.log('Making API request:', { url, options: { ...options, headers: requestHeaders } });

      const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
        credentials: 'omit', // Do not send cookies or other credentials
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          // Try to get a more specific error message from the response body
          const text = await response.text();
          console.error(`Server returned error: ${response.status}`, text); // Log the full error text
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch (e) {
            // If the body is not JSON, use the text content as the error.
            errorMessage = text.substring(0, 500); // Limit length
          }
        } catch (e) {
          // Ignore if reading text fails, stick with the status code message.
        }
        return { error: errorMessage, response };
      }
      
      // For 204 No Content responses
      if (response.status === 204) {
        return { data: {} as T, response };
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { data, response };
      } else {
        const text = await response.text();
        return { error: `Expected JSON response, but got '${contentType}'. Response: ${text.substring(0, 200)}...`, response };
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  
  public isConnected(): boolean {
    return this._isConnected;
  }
}

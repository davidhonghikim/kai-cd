import { mergeHeaders } from './headers';

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE'
    });
  }

  /**
   * Make a request with error handling and response parsing
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = mergeHeaders(options.headers as Record<string, string>, this.apiKey);

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch {
            errorMessage = text.substring(0, 500);
          }
        } catch {
          // Ignore if reading text fails
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }

      const text = await response.text();
      throw new Error(`Expected JSON response, but got '${contentType}'. Response: ${text.substring(0, 200)}...`);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
} 
import toast from 'react-hot-toast';
import { useServiceStore } from '../store/serviceStore';
import type { AuthDefinition } from '../types';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private async request(url: string, options: ApiClientOptions = {}) {
    const { method = 'GET', headers = {}, body } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }
      return await response.json();
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
  }

  private getHeaders(auth: AuthDefinition, customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (auth.type === 'bearer_token' && auth.credentials?.token) {
      headers['Authorization'] = `Bearer ${auth.credentials.token}`;
    } else if (auth.type === 'api_key' && auth.credentials?.apiKey) {
      headers['Authorization'] = `Bearer ${auth.credentials.apiKey}`;
    }
    
    return headers;
  }

  async get(baseUrl: string, path: string, auth: AuthDefinition, headers: Record<string, string> = {}) {
    return this.request(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'GET',
      headers: this.getHeaders(auth, headers),
    });
  }

  async post(baseUrl: string, path: string, data: any, auth: AuthDefinition, headers: Record<string, string> = {}) {
    return this.request(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: this.getHeaders(auth, headers),
      body: JSON.stringify(data),
    });
  }

  async put(baseUrl: string, path: string, data: any, auth: AuthDefinition, headers: Record<string, string> = {}) {
    return this.request(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(auth, headers),
      body: JSON.stringify(data),
    });
  }

  async del(baseUrl: string, path: string, auth: AuthDefinition, headers: Record<string, string> = {}) {
    return this.request(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(auth, headers),
    });
  }

  async *postStream(
    baseUrl: string,
    path: string,
    payload: any,
    auth: AuthDefinition,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const fullUrl = `${baseUrl.replace(/\/$/, '')}${path}`;
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getHeaders(auth),
        body: JSON.stringify(payload),
        signal: signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream fetch aborted');
        toast.success('Request stopped.');
      } else {
        console.error('Streaming failed:', error);
        toast.error(`Streaming failed: ${(error as Error).message}`);
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 
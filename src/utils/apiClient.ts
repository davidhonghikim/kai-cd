import { toast } from 'react-hot-toast';
import { useServiceStore } from '../store/serviceStore';
import type { AuthDefinition } from '../types';
import { logger } from './logger';

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
      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = { message: responseText || response.statusText };
        }
        throw new Error(errorData.message || 'An unknown error occurred');
      }

      try {
        // Try to parse as JSON, but fall back to raw text if it fails
        return JSON.parse(responseText);
      } catch (e) {
        return responseText;
      }
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
    const headers = this.getHeaders(auth);
    
    logger.log('[apiClient.postStream] Attempting to stream from URL:', fullUrl);
    logger.log('[apiClient.postStream] With headers:', headers);
    logger.log('[apiClient.postStream] With body:', payload);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[apiClient.postStream] Network response was not ok.', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
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
      if ((error as Error).name !== 'AbortError') {
        logger.error('Streaming failed:', error);
        toast.error(`Streaming failed: ${(error as Error).message}`);
      }
      throw error;
    }
  }

  async head(baseUrl: string, path: string, auth: AuthDefinition, headers: Record<string, string> = {}) {
    const url = `${baseUrl.replace(/\/$/, '')}${path}`;
    const allHeaders = this.getHeaders(auth, headers);
    const response = await fetch(url, { method: 'HEAD', headers: allHeaders });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response; // HEAD responses have no body to parse
  }
}

export const apiClient = new ApiClient(); 
import { toast } from 'react-hot-toast';
import { useServiceStore } from '../store/serviceStore';
import useVaultStore from '../store/vaultStore';
import type { AuthType } from '../types';
import { logger } from './logger';
import { getErrorInfo, type ErrorInfo } from '../config/errorCodes';
import { DEFAULT_REQUEST_TIMEOUT_MS } from '../config/constants';

// Custom Error class for API-specific issues
export class ApiError extends Error {
  public code: string;
  public errorInfo: ErrorInfo;

  constructor(code: string, message?: string) {
    const errorInfo = getErrorInfo(code);
    super(message || errorInfo.message);
    this.name = 'ApiError';
    this.code = code;
    this.errorInfo = errorInfo;
  }
}

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

const validateUrl = (url: string) => {
    if (!url || typeof url !== 'string') {
        throw new ApiError('ERR_INVALID_URL', 'URL is null or not a string.');
    }
    try {
        new URL(url);
    } catch (_e) {
        throw new ApiError('ERR_INVALID_URL', `Invalid URL format: "${url}"`);
    }
}

class ApiClient {
  private async fetchWithTimeout(fullUrl: string, config: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(fullUrl, { ...config, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  private async request(fullUrl: string, options: ApiClientOptions = {}) {
    validateUrl(fullUrl);
    
    const { method = 'GET', headers = {}, body } = options;

    const config: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      signal: options.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const retries = 2;
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await this.fetchWithTimeout(fullUrl, config, options.timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS);
        
        if (!response.ok) {
          let code = 'ERR_UNKNOWN';
          if (response.status === 401 || response.status === 403) code = 'ERR_API_UNAUTHORIZED';
          if (response.status >= 500) code = 'ERR_API_SERVER_ERROR';
          const errorText = await response.text();
          throw new ApiError(code, errorText || `HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        try {
          return JSON.parse(responseText);
        } catch (_e) {
          return responseText;
        }
      } catch (error) {
        // If timeout or network failure and we have retries left, retry
        if (attempt < retries && !(error instanceof ApiError)) {
          attempt++;
          logger.warn(`[apiClient] Retry ${attempt} for ${fullUrl}`);
          continue;
        }
        if (error instanceof ApiError) {
            throw error; // Re-throw custom errors
        }
        // Catch network errors (e.g., service down)
        logger.error('API Client Network Error:', { error });
        throw new ApiError('ERR_API_UNREACHABLE', (error as Error).message);
      }
    }
  }

  private getHeaders(authType: AuthType, credentialValue: string | null, customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (credentialValue) {
        if (authType === 'bearer_token') {
            headers['Authorization'] = `Bearer ${credentialValue}`;
        } else if (authType === 'api_key' && customHeaders.keyName) {
            headers[customHeaders.keyName] = credentialValue;
        }
    }
    
    return headers;
  }

  public buildUrl(baseUrl: string, path: string): string {
    // If path is already a full URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const url = new URL(baseUrl);

    // If path starts with a slash, treat it as an absolute path on the host.
    // This is useful for services that have a fixed API root like `/sdapi/v1`.
    if (path.startsWith('/')) {
        url.pathname = path;
    } else {
        // Otherwise, join the paths safely, handling leading/trailing slashes.
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }
    
    return url.toString();
  }
  
  private getAuthDetails(serviceId: string) {
    const service = useServiceStore.getState().getServiceById(serviceId);
    if (!service) throw new ApiError('ERR_SERVICE_NOT_FOUND');
    
    const { credentialId, authentication, headers, url } = service;
    const { credentials } = useVaultStore.getState();
    
    const credential = credentials.find(c => c.id === credentialId);
    const credentialValue = credential ? credential.value : null;

    const finalHeaders = { ...headers };
    if (authentication.type === 'api_key' && authentication.keyName) {
        finalHeaders.keyName = authentication.keyName;
    }

    return { url, authType: authentication.type, credentialValue, headers: finalHeaders };
  }

  async get(serviceId: string, path: string) {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    return this.request(fullUrl, {
      method: 'GET',
      headers: this.getHeaders(authType, credentialValue, headers),
    });
  }

  async post(serviceId: string, path: string, data: any) {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    return this.request(fullUrl, {
      method: 'POST',
      headers: this.getHeaders(authType, credentialValue, headers),
      body: data,
    });
  }

  async put(serviceId: string, path: string, data: any) {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    return this.request(fullUrl, {
      method: 'PUT',
      headers: this.getHeaders(authType, credentialValue, headers),
      body: data,
    });
  }

  async del(serviceId: string, path: string) {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    return this.request(fullUrl, {
      method: 'DELETE',
      headers: this.getHeaders(authType, credentialValue, headers),
    });
  }

  async *postStream(
    serviceId: string,
    path: string,
    payload: any,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    validateUrl(fullUrl);
    
    const requestHeaders = this.getHeaders(authType, credentialValue, headers);
    
    logger.debug('[apiClient.postStream] PRE-API-CALL:', { fullUrl, requestHeaders, payload });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...requestHeaders },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        let code = 'ERR_UNKNOWN';
        if (response.status === 401 || response.status === 403) code = 'ERR_API_UNAUTHORIZED';
        if (response.status >= 500) code = 'ERR_API_SERVER_ERROR';
        const errorText = await response.text();
        throw new ApiError(code, errorText || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get stream reader');

      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const decodedChunk = decoder.decode(value);
        logger.debug('[apiClient.postStream] Stream chunk received:', { chunk: decodedChunk });
        yield decodedChunk;
      }
    } catch (error) {
       if (error instanceof ApiError) {
          logger.error('API Stream Error', { code: error.code, message: error.message });
          toast.error(error.errorInfo.message);
          throw error;
       }
       if ((error as Error).name !== 'AbortError') {
         const apiError = new ApiError('ERR_API_UNREACHABLE', (error as Error).message);
         logger.error('API Stream Network Error', { error: apiError });
         toast.error(apiError.errorInfo.message);
         throw apiError;
       }
       throw error; // Re-throw AbortError silently
    }
  }

  async head(serviceId: string, path: string) {
    const { url, authType, credentialValue, headers } = this.getAuthDetails(serviceId);
    const fullUrl = this.buildUrl(url, path);
    try {
      validateUrl(fullUrl);
    } catch (e) {
      return Promise.reject(e);
    }
    const allHeaders = this.getHeaders(authType, credentialValue, headers);
    const response = await fetch(fullUrl, { method: 'HEAD', headers: allHeaders });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response; // HEAD responses have no body to parse
  }
}

export const apiClient = new ApiClient(); 
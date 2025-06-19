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

  get(baseUrl: string, path: string, headers?: Record<string, string>) {
    return this.request(`${baseUrl}${path}`, { method: 'GET', headers });
  }

  post(baseUrl: string, path: string, data: any, headers?: Record<string, string>) {
    return this.request(`${baseUrl}${path}`, { method: 'POST', body: data, headers });
  }

  put(baseUrl: string, path: string, data: any, headers?: Record<string, string>) {
    return this.request(`${baseUrl}${path}`, { method: 'PUT', body: data, headers });
  }

  delete(baseUrl: string, path: string, headers?: Record<string, string>) {
    return this.request(`${baseUrl}${path}`, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(); 
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface PatronClientConfig {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
}

export class PatronClient {
  private http: AxiosInstance;

  constructor(config: PatronClientConfig = {}) {
    this.http = axios.create({
      baseURL: config.baseURL || 'https://api.patron.com',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
    });
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<T>(path, config);
    return response.data;
  }

  async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<T>(path, data, config);
    return response.data;
  }

  async put<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<T>(path, data, config);
    return response.data;
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(path, config);
    return response.data;
  }
}
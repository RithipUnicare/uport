import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { StorageService, STORAGE_KEYS } from '../utils/storage';

const BASE_URL = 'https://uports.in/admin';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async config => {
        const token = await StorageService.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = token;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      },
    );
  }

  // Generic GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Convenience method to build image URLs
  getImageUrl(imagePath: string, baseImageUrl: string): string {
    if (!imagePath) return '';
    return `${BASE_URL}${baseImageUrl}${imagePath}`;
  }
}

export default new ApiService();

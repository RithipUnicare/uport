import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { StorageService, STORAGE_KEYS } from '../utils/storage';
import Toast from 'react-native-toast-message';

export const BASE_URL = 'https://routegadi.com/admin/';

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
        // Essential: Prevent leading slash from stripping baseURL path (/admin/)
        if (config.url?.startsWith('/')) {
          config.url = config.url.substring(1);
        }

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
        const fullUrl = error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'Unknown URL';
        console.error(`API Error [${error.response?.status}] at ${fullUrl}:`, error);

        // Show actual failing URL in Toast for debugging - making it clearer
        Toast.show({
          type: 'error',
          text1: `Error ${error.response?.status || 'Failed'}`,
          text2: `Path: ${error.config?.url || 'unknown'}`,
          visibilityTime: 6000,
        });

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
  getImageUrl(
    imagePath: string,
    baseImageUrl: string = '/dashboard/image/',
  ): string {
    if (!imagePath) return '';
    // If imagePath already contains http/https, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/'}${baseImageUrl.startsWith('/') ? baseImageUrl.substring(1) : baseImageUrl}${imagePath}`;
  }

  // Get the base URL
  getBaseUrl(): string {
    return BASE_URL;
  }
}

export default new ApiService();

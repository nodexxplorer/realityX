// lib/admin/api/client.ts

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/admin', // Use Next.js API routes instead of backend
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    /**
     * REQUEST INTERCEPTOR
     * Adds authentication token to all requests
     */
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    /**
     * RESPONSE INTERCEPTOR
     * Handles errors globally
     */
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // Only redirect if not already on login page
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
          }
        }

        // Handle 403 Forbidden - user not admin
        if (error.response?.status === 403) {
          console.error('Access denied: Admin privileges required');
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Format error response into consistent structure
   */
  private formatError(error: AxiosError): ApiError {
    // Type assertion for error.response?.data
    const errorData = error.response?.data as any;

    return {
      message: errorData?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data,
    };
  }

  /**
   * GET REQUEST
   * @param url - Endpoint URL
   * @param config - Axios config (params, headers, etc.)
   */
  async get<T>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET ${url}:`, error);
      throw error;
    }
  }

  /**
   * POST REQUEST
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Axios config
   */
  async post<T>(url: string, data = {}, config = {}): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url}:`, error);
      throw error;
    }
  }

  /**
   * PUT REQUEST
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Axios config
   */
  async put<T>(url: string, data = {}, config = {}): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url}:`, error);
      throw error;
    }
  }

  /**
   * DELETE REQUEST
   * @param url - Endpoint URL
   * @param config - Axios config
   */
  async delete<T>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url}:`, error);
      throw error;
    }
  }

  /**
   * PATCH REQUEST
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Axios config
   */
  async patch<T>(url: string, data = {}, config = {}): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${url}:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

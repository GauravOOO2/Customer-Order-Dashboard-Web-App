// src/config/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AxiosResponse } from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  API_VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  TIMEOUT: 10000, // 10 seconds
};

// API Response interface
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any[];
  timestamp?: string;
  path?: string;
  method?: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add auth token if available in the future
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message);
          break;
        case 401:
          console.error('Unauthorized:', data.message);
          // Handle logout if needed
          break;
        case 403:
          console.error('Forbidden:', data.message);
          break;
        case 404:
          console.error('Not Found:', data.message);
          break;
        case 500:
          console.error('Server Error:', data.message);
          break;
        default:
          console.error('API Error:', data.message);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      return Promise.reject({
        status: 'error',
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({
        status: 'error',
        message: 'An unexpected error occurred.',
      });
    }
  }
);

export default apiClient;
export { API_CONFIG };
import type { 
  ApiResponse, 
  Customer, 
  CustomerListResponse, 
  CustomerFilters, 
  CustomerStats 
} from '../types';

// Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  API_VERSION: '/api/v1',
  TIMEOUT: 10000,
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Array<{ field: string; message: string; value?: any }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  }
  // Customer API methods
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/customers${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<CustomerListResponse>(endpoint);
    return response.data!;
  }

  async getCustomerById(id: number, includeOrders = false): Promise<Customer> {
    const params = new URLSearchParams();
    if (includeOrders) {
      params.append('include_orders', 'true');
    }
    
    const queryString = params.toString();
    const endpoint = `/customers/${id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<{ customer: Customer }>(endpoint);
    return response.data!.customer;
  }

  async getCustomerStats(): Promise<CustomerStats> {
    const response = await this.request<CustomerStats>('/customers/stats');
    return response.data!;
  }

  async searchCustomers(searchData: {
    query?: string;
    filters?: any;
    sort?: { field: string; order: 'asc' | 'desc' };
    page?: number;
    limit?: number;
  }): Promise<CustomerListResponse> {
    const response = await this.request<CustomerListResponse>('/customers/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
    return response.data!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    return await response.json();
  }
}

export const apiService = new ApiService();
export { ApiError };

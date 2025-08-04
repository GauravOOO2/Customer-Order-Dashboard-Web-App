// src/services/api.ts
import apiClient from '../config/api';
import type { ApiResponse } from '../config/api';
import type {
  CustomersResponse,
  CustomerDetailResponse,
  CustomerStats,
  OrdersResponse,
  OrderDetailResponse,
  CustomerOrdersResponse,
  OrderStats,
  CustomerFilters,
  OrderFilters,
} from '../types';

// Customer API Services
export const customerService = {
  // Get all customers with filters and pagination
  getCustomers: async (params: CustomerFilters = {}): Promise<ApiResponse<CustomersResponse>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/customers?${queryString}` : '/customers';
    
    return await apiClient.get(url);
  },

  // Get specific customer by ID
  getCustomerById: async (id: number, includeOrders: boolean = true): Promise<ApiResponse<CustomerDetailResponse>> => {
    return await apiClient.get(`/customers/${id}?include_orders=${includeOrders}`);
  },

  // Get customer statistics
  getCustomerStats: async (period: string = 'monthly'): Promise<ApiResponse<CustomerStats>> => {
    return await apiClient.get(`/customers/stats?period=${period}`);
  },

  // Advanced customer search
  searchCustomers: async (searchData: any): Promise<ApiResponse<CustomersResponse>> => {
    return await apiClient.post('/customers/search', searchData);
  },
};

// Order API Services
export const orderService = {
  // Get all orders with filters and pagination
  getOrders: async (params: OrderFilters = {}): Promise<ApiResponse<OrdersResponse>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    return await apiClient.get(url);
  },

  // Get specific order by ID
  getOrderById: async (id: number, includeCustomer: boolean = true): Promise<ApiResponse<OrderDetailResponse>> => {
    return await apiClient.get(`/orders/${id}?include_customer=${includeCustomer}`);
  },

  // Get orders for specific customer
  getOrdersByCustomer: async (userId: number, params: Partial<OrderFilters> = {}): Promise<ApiResponse<CustomerOrdersResponse>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/orders/customer/${userId}?${queryString}` : `/orders/customer/${userId}`;
    
    return await apiClient.get(url);
  },

  // Get order statistics
  getOrderStats: async (period: string = 'monthly'): Promise<ApiResponse<OrderStats>> => {
    return await apiClient.get(`/orders/stats?period=${period}`);
  },

  // Get order fulfillment analytics
  getOrderFulfillment: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/orders/fulfillment');
  },
};

// Health check service
export const healthService = {
  checkHealth: async (): Promise<ApiResponse<any>> => {
    return await apiClient.get('/health');
  },
};
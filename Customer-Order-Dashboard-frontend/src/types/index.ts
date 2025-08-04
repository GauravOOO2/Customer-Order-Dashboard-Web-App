// src/types/index.ts

// Customer Types
export interface Customer {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  location: {
    state?: string;
    city?: string;
    country?: string;
    street_address?: string;
    postal_code?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  traffic_source?: string;
  created_at: string;
  order_count?: number;
  total_orders_value?: number;
  latest_order_date?: string;
}

// Order Types
export interface Order {
  order_id: number;
  user_id: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  gender?: 'M' | 'F' | 'Other';
  created_at: string;
  returned_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  num_of_item: number;
  total_amount?: number;
  currency?: string;
  customer_details?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
}

// Pagination Types
export interface Pagination {
  current_page: number;
  total_pages: number;
  page_size: number;
  total_count: number;
  has_next_page: boolean;
  has_prev_page: boolean;
  next_page?: number;
  prev_page?: number;
  start_index: number;
  end_index: number;
}

// API Response Types
export interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
  filters?: {
    search?: string;
    state?: string;
    city?: string;
    gender?: string;
    traffic_source?: string;
    age_range?: {
      min?: number;
      max?: number;
    };
  };
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
  filters?: {
    status?: string;
    user_id?: number;
    date_range?: {
      from?: string;
      to?: string;
    };
    amount_range?: {
      min?: number;
      max?: number;
    };
  };
}

export interface CustomerDetailResponse {
  customer: Customer & {
    full_name: string;
    order_summary: {
      total_orders: number;
      total_spent: number;
      total_items_purchased: number;
      average_order_value: number;
      latest_order_date?: string;
      first_order_date?: string;
      order_statuses: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        returned: number;
      };
    };
  };
  recent_orders?: Order[];
}

export interface CustomerOrdersResponse {
  customer: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  order_statistics: {
    total_orders: number;
    total_spent: number;
    total_items: number;
    order_statuses: {
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
    };
  };
  orders: Order[];
  pagination: Pagination;
  filters?: {
    status?: string;
  };
}

export interface OrderDetailResponse {
  order: Order & {
    order_timeline: {
      processing_days?: number;
      delivery_days?: number;
      total_fulfillment_days?: number;
    };
  };
  customer?: Customer;
}

// Statistics Types
export interface CustomerStats {
  overview: {
    total_customers: number;
    customers_with_orders: number;
    average_orders_per_customer: number;
    average_lifetime_value: number;
  };
  demographics: {
    gender_distribution: Array<{ _id: string; count: number }>;
    age_distribution?: Array<{ _id: string; count: number; avgAge: number }>;
    top_states: Array<{ _id: string; count: number }>;
    traffic_sources: Array<{ _id: string; count: number }>;
  };
  trends?: {
    registration_trends: Array<{ _id: string; count: number }>;
    period: string;
  };
}

export interface OrderStats {
  overview: {
    total_orders: number;
    total_customers: number;
    total_revenue: number;
    average_order_value: number;
    average_items_per_order: number;
    max_order_value: number;
    min_order_value: number;
  };
  order_distribution: {
    by_status: Array<{ _id: string; count: number; total_amount: number }>;
    by_period: Array<{ _id: string; order_count: number; total_revenue: number; total_items: number }>;
  };
  period: string;
}

// Filter Types
export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  city?: string;
  country?: string;
  gender?: string;
  traffic_source?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  user_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}
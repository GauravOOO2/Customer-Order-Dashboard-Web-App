// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  timestamp?: string;
}

// Customer Types
export interface CustomerLocation {
  state: string;
  street_address: string;
  postal_code: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Customer {
  _id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  location: CustomerLocation;
  traffic_source: 'Search' | 'Email' | 'Social' | 'Direct' | 'Referral' | 'Paid';
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

// Order Types
export interface Order {
  _id: string;
  order_id: number;
  user_id: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  gender: 'M' | 'F' | 'Other';
  created_at: string;
  returned_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  num_of_item: number;
  total_amount: number;
  currency: string;
}

// Pagination Types
export interface PaginationMetadata {
  current_page: number;
  total_pages: number;
  page_size: number;
  total_count: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: PaginationMetadata;
}

// Search and Filter Types
export interface CustomerFilters {
  search?: string;
  state?: string;
  city?: string;
  country?: string;
  gender?: 'M' | 'F' | 'Other';
  traffic_source?: 'Search' | 'Email' | 'Social' | 'Direct' | 'Referral' | 'Paid';
  min_age?: number;
  max_age?: number;
  sort_by?: 'created_at' | 'first_name' | 'last_name' | 'email' | 'age';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Statistics Types
export interface CustomerStats {
  total_customers: number;
  by_gender: Record<string, number>;
  by_traffic_source: Record<string, number>;
  by_location: Record<string, number>;
  registration_trends: Array<{
    date: string;
    count: number;
  }>;
}

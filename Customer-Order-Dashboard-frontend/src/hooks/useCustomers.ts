import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';
import type { Customer, CustomerListResponse, CustomerFilters } from '../types';

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  pagination: CustomerListResponse['pagination'] | null;
  refetch: () => void;
  setFilters: (filters: CustomerFilters) => void;
}

export const useCustomers = (initialFilters: CustomerFilters = {}): UseCustomersResult => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<CustomerListResponse['pagination'] | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCustomers(filters);
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    pagination,
    refetch: fetchCustomers,
    setFilters,
  };
};

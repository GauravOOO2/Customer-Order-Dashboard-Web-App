import { useState, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';
import type { Customer } from '../types';

interface UseCustomerDetailResult {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  fetchCustomer: (id: number, includeOrders?: boolean) => Promise<void>;
}

export const useCustomerDetail = (): UseCustomerDetailResult => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async (id: number, includeOrders = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCustomerById(id, includeOrders);
      setCustomer(response);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch customer details';
      setError(errorMessage);
      console.error('Error fetching customer:', err);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    customer,
    loading,
    error,
    fetchCustomer,
  };
};

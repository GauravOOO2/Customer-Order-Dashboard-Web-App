import React, { useState, useCallback } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { SearchBar } from './SearchBar';
import { CustomerTable } from './CustomerTable';
import { Pagination } from './Pagination';
import { DashboardStats } from './DashboardStats';
import type { CustomerFilters, Customer } from '../types';

export const Dashboard: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { customers, loading, error, pagination, setFilters } = useCustomers({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const handleSearch = useCallback((filters: CustomerFilters) => {
    setFilters(filters);
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, [setFilters]);

  const handleCustomerClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            </div>
          </div>
          <div className="text-sm text-red-700 mb-4">
            {error}
          </div>
          <div className="text-xs text-red-600">
            Please ensure the backend server is running on the correct port and try refreshing the page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage and analyze your customer data with advanced filtering and search capabilities.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats 
          customers={customers} 
          pagination={pagination} 
          loading={loading} 
        />

        {/* Search */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Customer Table */}
        <div className="mb-6">
          <CustomerTable 
            customers={customers} 
            loading={loading}
            onCustomerClick={handleCustomerClick}
          />
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination 
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer Details
                </h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm text-gray-900">{selectedCustomer.first_name} {selectedCustomer.last_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{selectedCustomer.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Age</dt>
                      <dd className="text-sm text-gray-900">{selectedCustomer.age} years old</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedCustomer.gender === 'M' ? 'Male' : selectedCustomer.gender === 'F' ? 'Female' : 'Other'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Tracking</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedCustomer.location.street_address}<br />
                        {selectedCustomer.location.city}, {selectedCustomer.location.state}<br />
                        {selectedCustomer.location.postal_code}, {selectedCustomer.location.country}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Traffic Source</dt>
                      <dd className="text-sm text-gray-900">{selectedCustomer.traffic_source}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedCustomer.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                    {selectedCustomer.order_count !== undefined && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order Count</dt>
                        <dd className="text-sm text-gray-900">{selectedCustomer.order_count} orders</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

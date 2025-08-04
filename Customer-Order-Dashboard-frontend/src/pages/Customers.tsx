// src/pages/Customers.tsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  Users,
  UserCheck,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerService } from '../services/api';
import type { Customer } from '../types';
import type { CustomerFilters } from '../types';
import clsx from 'clsx';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20,
    search: '',
    state: '',
    gender: '',
    traffic_source: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Fetch customers data
  const {
    data: customersData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['customers', filters],
    () => customerService.getCustomers(filters),
    {
      keepPreviousData: true,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch customers');
      },
    }
  );

  // Fetch customer statistics
  const { data: statsData } = useQuery(
    ['customer-stats'],
    () => customerService.getCustomerStats(),
    {
      onError: (error: any) => {
        console.error('Failed to fetch customer stats:', error);
      },
    }
  );

  const customers = customersData?.data?.customers || [];
  const pagination = customersData?.data?.pagination || {};
  const stats = statsData?.data?.overview || {};

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof CustomerFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      state: '',
      gender: '',
      traffic_source: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading customers...</span>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">{message}</div>
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  // Stats card component
  const StatsCard = ({ 
    title, 
    value, 
    icon: Icon, 
    iconColor, 
    bgColor 
  }: { 
    title: string; 
    value: string; 
    icon: React.ComponentType<{ className?: string }>; 
    iconColor: string; 
    bgColor: string; 
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={clsx('p-3 rounded-md', bgColor)}>
              <Icon className={clsx('h-6 w-6', iconColor)} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={(error as any).message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={stats.total_customers?.toLocaleString() || '0'}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Active Customers"
          value={stats.customers_with_orders?.toLocaleString() || '0'}
          icon={UserCheck}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          title="Avg Orders/Customer"
          value={stats.average_orders_per_customer?.toFixed(1) || '0.0'}
          icon={ShoppingBag}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatsCard
          title="Avg Lifetime Value"
          value={`${stats.average_lifetime_value?.toFixed(0) || '0'}`}
          icon={TrendingUp}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search customers by name or email..."
              />
            </div>
          </form>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filters.traffic_source || ''}
              onChange={(e) => handleFilterChange('traffic_source', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              <option value="Search">Search</option>
              <option value="Email">Email</option>
              <option value="Social">Social</option>
              <option value="Direct">Direct</option>
              <option value="Referral">Referral</option>
              <option value="Paid">Paid</option>
            </select>

            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split('-');
                handleFilterChange('sort_by', sort_by);
                handleFilterChange('sort_order', sort_order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="first_name-asc">Name A-Z</option>
              <option value="first_name-desc">Name Z-A</option>
              <option value="age-asc">Age Low-High</option>
              <option value="age-desc">Age High-Low</option>
            </select>

            {(filters.search || filters.gender || filters.traffic_source) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Customers
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {pagination.total_count ? `${pagination.total_count} total customers` : 'No customers found'}
          </p>
        </div>
        
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {customers.map((customer: Customer) => (
              <li key={customer.user_id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </p>
                          {customer.gender && (
                            <span className={clsx(
                              'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              customer.gender === 'M' ? 'bg-blue-100 text-blue-800' :
                              customer.gender === 'F' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {customer.gender}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.email}
                          </div>
                          {customer.location?.city && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {customer.location.city}, {customer.location.state}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(customer.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Order Count */}
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-900">
                          <ShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-medium">{customer.order_count || 0}</span>
                          <span className="text-gray-500 ml-1">orders</span>
                        </div>
                        {customer.traffic_source && (
                          <div className="text-xs text-gray-500">
                            via {customer.traffic_source}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <Link
                        to={`/customers/${customer.user_id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev_page}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{pagination.start_index}</span>{' '}
                  to{' '}
                  <span className="font-medium">{pagination.end_index}</span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total_count}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const pageNumber = Math.max(1, pagination.current_page - 2) + i;
                    if (pageNumber > pagination.total_pages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={clsx(
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          pageNumber === pagination.current_page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
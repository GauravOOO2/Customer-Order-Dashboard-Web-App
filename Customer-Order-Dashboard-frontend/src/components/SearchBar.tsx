import React, { useState, useCallback } from 'react';
import type { CustomerFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: CustomerFilters) => void;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<CustomerFilters>>({});

  const handleSearch = useCallback(() => {
    onSearch({
      search: searchTerm.trim() || undefined,
      ...filters,
      page: 1, // Reset to first page on new search
    });
  }, [searchTerm, filters, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    onSearch({ page: 1 });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Customers
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
            <button
              onClick={clearFilters}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.gender || ''}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value as any || undefined })}
            >
              <option value="">All</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="traffic_source" className="block text-sm font-medium text-gray-700 mb-1">
              Traffic Source
            </label>
            <select
              id="traffic_source"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.traffic_source || ''}
              onChange={(e) => setFilters({ ...filters, traffic_source: e.target.value as any || undefined })}
            >
              <option value="">All Sources</option>
              <option value="Search">Search</option>
              <option value="Email">Email</option>
              <option value="Social">Social</option>
              <option value="Direct">Direct</option>
              <option value="Referral">Referral</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort_by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort_by"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.sort_by || 'created_at'}
              onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
            >
              <option value="created_at">Registration Date</option>
              <option value="first_name">First Name</option>
              <option value="last_name">Last Name</option>
              <option value="email">Email</option>
              <option value="age">Age</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sort_order"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.sort_order || 'desc'}
              onChange={(e) => setFilters({ ...filters, sort_order: e.target.value as any })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

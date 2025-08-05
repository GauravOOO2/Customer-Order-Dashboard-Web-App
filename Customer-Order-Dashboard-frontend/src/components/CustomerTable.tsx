import React from 'react';
import type { Customer } from '../types';

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onCustomerClick?: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ 
  customers, 
  loading = false, 
  onCustomerClick 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'M':
        return <span className="text-blue-500">♂</span>;
      case 'F':
        return <span className="text-pink-500">♀</span>;
      default:
        return <span className="text-gray-500">⚤</span>;
    }
  };

  const getTrafficSourceBadge = (source: string) => {
    const colors = {
      Search: 'bg-green-100 text-green-800',
      Email: 'bg-blue-100 text-blue-800',
      Social: 'bg-purple-100 text-purple-800',
      Direct: 'bg-gray-100 text-gray-800',
      Referral: 'bg-orange-100 text-orange-800',
      Paid: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {source}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demographics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traffic Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr 
                key={customer.user_id} 
                className={`hover:bg-gray-50 transition-colors ${onCustomerClick ? 'cursor-pointer' : ''}`}
                onClick={() => onCustomerClick?.(customer)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                        {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.user_id}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getGenderIcon(customer.gender)}
                    <span className="text-sm text-gray-900">Age {customer.age}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.location.city}, {customer.location.state}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.location.country}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTrafficSourceBadge(customer.traffic_source)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.order_count !== undefined ? (
                      <span className="font-medium">{customer.order_count} orders</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  {customer.total_spent !== undefined && (
                    <div className="text-sm text-green-600 font-medium">
                      ${customer.total_spent.toFixed(2)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

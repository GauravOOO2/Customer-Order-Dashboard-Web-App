import React from 'react';
import type { Customer, PaginationMetadata } from '../types';

interface DashboardStatsProps {
  customers: Customer[];
  pagination: PaginationMetadata | null;
  loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  customers, 
  pagination, 
  loading = false 
}) => {
  const calculateStats = () => {
    if (!customers.length) {
      return {
        totalCustomers: 0,
        averageAge: 0,
        genderBreakdown: { M: 0, F: 0, Other: 0 },
        topTrafficSource: 'N/A',
        totalOrders: 0,
      };
    }

    const totalCustomers = pagination?.total_count || customers.length;
    const averageAge = customers.reduce((sum, customer) => sum + customer.age, 0) / customers.length;
    
    const genderBreakdown = customers.reduce((acc, customer) => {
      acc[customer.gender] = (acc[customer.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trafficSources = customers.reduce((acc, customer) => {
      acc[customer.traffic_source] = (acc[customer.traffic_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTrafficSource = Object.entries(trafficSources)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    const totalOrders = customers.reduce((sum, customer) => 
      sum + (customer.order_count || 0), 0
    );

    return {
      totalCustomers,
      averageAge: Math.round(averageAge),
      genderBreakdown,
      topTrafficSource,
      totalOrders,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
              <dd className="text-lg font-medium text-gray-900">{stats.totalCustomers.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Average Age</dt>
              <dd className="text-lg font-medium text-gray-900">{stats.averageAge} years</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Gender Split</dt>
              <dd className="text-lg font-medium text-gray-900">
                {stats.genderBreakdown.M || 0}M/{stats.genderBreakdown.F || 0}F
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Top Source</dt>
              <dd className="text-lg font-medium text-gray-900">{stats.topTrafficSource}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
              <dd className="text-lg font-medium text-gray-900">{stats.totalOrders.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

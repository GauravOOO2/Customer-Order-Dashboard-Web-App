import React from 'react';
import type { Customer, PaginationMetadata } from '../types';

interface DashboardHeaderProps {
  customers: Customer[];
  pagination: PaginationMetadata | null;
  loading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  customers,
  pagination,
  loading = false
}) => {
  const calculateSummaryStats = () => {
    if (!customers.length) {
      return {
        totalCustomers: 0,
        avgAge: 0,
        totalOrders: 0,
        maleCount: 0,
        femaleCount: 0
      };
    }

    const totalOrders = customers.reduce((sum, customer) => 
      sum + (customer.order_count || 0), 0
    );
    
    const avgAge = customers.reduce((sum, customer) => 
      sum + customer.age, 0
    ) / customers.length;

    const maleCount = customers.filter(c => c.gender === 'M').length;
    const femaleCount = customers.filter(c => c.gender === 'F').length;

    return {
      totalCustomers: pagination?.total_count || customers.length,
      avgAge: Math.round(avgAge),
      totalOrders,
      maleCount,
      femaleCount
    };
  };

  const stats = calculateSummaryStats();

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>
          <div className="w-8 h-8">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and analyze your customer base with detailed insights and analytics.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          color="text-blue-600"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="text-green-600"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          }
        />

        <StatCard
          title="Average Age"
          value={`${stats.avgAge} years`}
          color="text-purple-600"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          }
        />

        <StatCard
          title="Gender Ratio"
          value={`${stats.maleCount}M / ${stats.femaleCount}F`}
          color="text-orange-600"
          icon={
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

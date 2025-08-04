// src/pages/Dashboard.tsx
import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { customerService, orderService } from '../services/api';
import type { Customer, Order } from '../types';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  // Fetch customer statistics
  const { data: customerStats } = useQuery(
    ['customer-stats'],
    () => customerService.getCustomerStats(),
    {
      onError: (error: any) => {
        console.error('Failed to fetch customer stats:', error);
      },
    }
  );

  // Fetch order statistics
  const { data: orderStats } = useQuery(
    ['order-stats'],
    () => orderService.getOrderStats(),
    {
      onError: (error: any) => {
        console.error('Failed to fetch order stats:', error);
      },
    }
  );

  // Fetch recent customers
  const { data: recentCustomers } = useQuery(
    ['recent-customers'],
    () => customerService.getCustomers({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    {
      onError: (error: any) => {
        console.error('Failed to fetch recent customers:', error);
      },
    }
  );

  // Fetch recent orders
  const { data: recentOrders } = useQuery(
    ['recent-orders'],
    () => orderService.getOrders({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    {
      onError: (error: any) => {
        console.error('Failed to fetch recent orders:', error);
      },
    }
  );

  const customerStatsData = customerStats?.data?.overview || {};
  const orderStatsData = orderStats?.data?.overview || {};
  const customers = recentCustomers?.data?.customers || [];
  const orders = recentOrders?.data?.orders || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats card component
  const StatsCard = ({ 
    title, 
    value, 
    icon: Icon, 
    iconColor, 
    bgColor,
    href 
  }: { 
    title: string; 
    value: string; 
    icon: React.ComponentType<{ className?: string }>; 
    iconColor: string; 
    bgColor: string;
    href: string;
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
        <div className="mt-3">
          <Link
            to={href}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            View details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={customerStatsData.total_customers?.toLocaleString() || '0'}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          href="/customers"
        />
        <StatsCard
          title="Total Orders"
          value={orderStatsData.total_orders?.toLocaleString() || '0'}
          icon={ShoppingCart}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          href="/orders"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(orderStatsData.total_revenue || 0)}
          icon={DollarSign}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          href="/analytics"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(orderStatsData.average_order_value || 0)}
          icon={TrendingUp}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          href="/analytics"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Customers
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest customer registrations
              </p>
            </div>
            <Link
              to="/customers"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {customers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading customers...</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {customers.map((customer: Customer) => (
                <li key={customer.user_id} className="hover:bg-gray-50">
                  <Link
                    to={`/customers/${customer.user_id}`}
                    className="block px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{customer.order_count || 0} orders</p>
                        <p className="text-sm text-gray-500">{formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Orders
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Latest order activity
              </p>
            </div>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {orders.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {orders.map((order: Order) => (
                <li key={order.order_id} className="hover:bg-gray-50">
                  <Link
                    to={`/orders/${order.order_id}`}
                    className="block px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.order_id}
                            </p>
                            <span className={clsx(
                              'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(order.status)
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {order.customer_details ? 
                              `${order.customer_details.first_name} ${order.customer_details.last_name}` : 
                              `Customer ID: ${order.user_id}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {order.total_amount ? formatCurrency(order.total_amount) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/customers"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View Customers</p>
              <p className="text-sm text-gray-500">Manage customer data</p>
            </div>
          </Link>
          
          <Link
            to="/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Track order status</p>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">Business insights</p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <Eye className="h-8 w-8 text-gray-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Reports</p>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
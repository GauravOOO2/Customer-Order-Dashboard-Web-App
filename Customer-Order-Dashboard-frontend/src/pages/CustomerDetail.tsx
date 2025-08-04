// src/pages/CustomerDetail.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerService, orderService } from '../services/api';
import type { Order } from '../types';
import clsx from 'clsx';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || '0');

  // Fetch customer details
  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError,
  } = useQuery(
    ['customer', customerId],
    () => customerService.getCustomerById(customerId),
    {
      enabled: !!customerId,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch customer details');
      },
    }
  );

  // Fetch customer orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useQuery(
    ['customer-orders', customerId],
    () => orderService.getOrdersByCustomer(customerId, { limit: 10 }),
    {
      enabled: !!customerId,
      onError: (error: any) => {
        console.error('Failed to fetch customer orders:', error);
      },
    }
  );

  const customer = customerData?.data?.customer;
  const orders = ordersData?.data?.orders || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'Processing':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Returned':
        return <RotateCcw className="h-5 w-5 text-gray-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
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

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading customer details...</span>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Customer not found</div>
        <Link
          to="/customers"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/customers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Customers
        </Link>
      </div>

      {/* Customer Info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-medium text-blue-600">
                {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {customer.full_name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Customer ID: {customer.user_id}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.email}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.location?.street_address && (
                  <div>{customer.location.street_address}</div>
                )}
                <div>
                  {customer.location?.city}, {customer.location?.state} {customer.location?.postal_code}
                </div>
                <div>{customer.location?.country}</div>
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Member Since
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(customer.created_at)}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Additional Info</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="space-y-1">
                  {customer.age && <div>Age: {customer.age}</div>}
                  {customer.gender && <div>Gender: {customer.gender}</div>}
                  {customer.traffic_source && <div>Acquisition: {customer.traffic_source}</div>}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Order Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customer.order_summary?.total_orders || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(customer.order_summary?.total_spent || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customer.order_summary?.total_items_purchased || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(customer.order_summary?.average_order_value || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest orders from this customer
            </p>
          </div>
          <Link
            to={`/orders?user_id=${customer.user_id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Orders
          </Link>
        </div>
        
        {ordersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This customer hasn't placed any orders.
            </p>
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
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="ml-4">
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
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {order.num_of_item} items
                          </div>
                          {order.total_amount && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(order.total_amount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-right text-sm text-gray-500">
                        {order.delivered_at && (
                          <div>Delivered {formatDate(order.delivered_at)}</div>
                        )}
                        {order.shipped_at && !order.delivered_at && (
                          <div>Shipped {formatDate(order.shipped_at)}</div>
                        )}
                        {!order.shipped_at && !order.delivered_at && order.status !== 'Cancelled' && (
                          <div>Processing</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Order Status Breakdown */}
      {customer.order_summary && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order Status Breakdown
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Distribution of orders by status
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
              {Object.entries(customer.order_summary.order_statuses).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
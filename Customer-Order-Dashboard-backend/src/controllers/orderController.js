// src/controllers/orderController.js
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPaginationOptions, getPaginationMetadata } = require('../utils/pagination');
const logger = require('../utils/logger');

/**
 * Get all orders with pagination, search, and filters
 * @route GET /api/v1/orders
 * @access Public
 */
const getAllOrders = catchAsync(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation Error', true, null, errors.array());
  }

  const {
    page = 1,
    limit = 20,
    status = '',
    user_id = '',
    sort_by = 'created_at',
    sort_order = 'desc',
    date_from = '',
    date_to = '',
    min_amount = '',
    max_amount = ''
  } = req.query;

  // Build query object
  const query = {};

  // Filter by status
  if (status) query.status = status;

  // Filter by user_id
  if (user_id) query.user_id = parseInt(user_id);

  // Date range filter
  if (date_from || date_to) {
    query.created_at = {};
    if (date_from) query.created_at.$gte = new Date(date_from);
    if (date_to) query.created_at.$lte = new Date(date_to);
  }

  // Amount range filter
  if (min_amount || max_amount) {
    query.total_amount = {};
    if (min_amount) query.total_amount.$gte = parseFloat(min_amount);
    if (max_amount) query.total_amount.$lte = parseFloat(max_amount);
  }

  // Pagination options
  const { skip, limitNum } = getPaginationOptions(page, limit);

  // Sort options
  const sortOrder = sort_order === 'desc' ? -1 : 1;
  const sortOptions = { [sort_by]: sortOrder };

  try {
    // Get orders with user details
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Order.countDocuments(query);

    // Get user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          const user = await User.findOne({ user_id: order.user_id }).lean();
          return {
            ...order,
            customer_details: user ? {
              user_id: user.user_id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              location: {
                city: user.location?.city,
                state: user.location?.state,
                country: user.location?.country
              }
            } : null
          };
        } catch (error) {
          console.log(`Error getting user details for order ${order.order_id}:`, error.message);
          return {
            ...order,
            customer_details: null
          };
        }
      })
    );

    // Get pagination metadata
    const pagination = getPaginationMetadata(totalCount, page, limitNum);

    // Log the request
    logger.info(`Retrieved ${orders.length} orders`, {
      page: pagination.current_page,
      total: totalCount,
      filters: { status, user_id, date_from, date_to }
    });

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Orders retrieved successfully',
      data: {
        orders: ordersWithUserDetails,
        pagination,
        filters: {
          status: status || null,
          user_id: user_id || null,
          date_range: {
            from: date_from || null,
            to: date_to || null
          },
          amount_range: {
            min: min_amount || null,
            max: max_amount || null
          }
        }
      }
    });

  } catch (error) {
    logger.error('Error in getAllOrders:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving orders');
  }
});

/**
 * Get all orders for a specific customer
 * @route GET /api/v1/orders/customer/:user_id
 * @access Public
 */
const getOrdersByCustomer = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const {
    page = 1,
    limit = 20,
    status = '',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  // Validate user_id
  if (!user_id || isNaN(user_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid customer ID');
  }

  const userId = parseInt(user_id);

  // Check if customer exists
  const customer = await User.findOne({ user_id: userId }).lean();
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  // Build query
  const query = { user_id: userId };
  if (status) query.status = status;

  // Pagination options
  const { skip, limitNum } = getPaginationOptions(page, limit);

  // Sort options
  const sortOrder = sort_order === 'desc' ? -1 : 1;
  const sortOptions = { [sort_by]: sortOrder };

  try {
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Order.countDocuments(query);

    // Calculate order statistics for this customer
    const allCustomerOrders = await Order.find({ user_id: userId }).lean();
    const orderStats = {
      total_orders: allCustomerOrders.length,
      total_spent: allCustomerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      total_items: allCustomerOrders.reduce((sum, order) => sum + (order.num_of_item || 0), 0),
      order_statuses: {
        pending: allCustomerOrders.filter(o => o.status === 'Pending').length,
        processing: allCustomerOrders.filter(o => o.status === 'Processing').length,
        shipped: allCustomerOrders.filter(o => o.status === 'Shipped').length,
        delivered: allCustomerOrders.filter(o => o.status === 'Delivered').length,
        cancelled: allCustomerOrders.filter(o => o.status === 'Cancelled').length,
        returned: allCustomerOrders.filter(o => o.status === 'Returned').length
      }
    };

    // Get pagination metadata
    const pagination = getPaginationMetadata(totalCount, page, limitNum);

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Customer orders retrieved successfully',
      data: {
        customer: {
          user_id: customer.user_id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email
        },
        order_statistics: orderStats,
        orders,
        pagination,
        filters: {
          status: status || null
        }
      }
    });

  } catch (error) {
    logger.error('Error in getOrdersByCustomer:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving customer orders');
  }
});

/**
 * Get specific order details
 * @route GET /api/v1/orders/:id
 * @access Public
 */
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { include_customer = 'true' } = req.query;

  // Validate ID
  if (!id || isNaN(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order ID');
  }

  const orderId = parseInt(id);

  // Find order
  const order = await Order.findOne({ order_id: orderId }).lean();
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Prepare response
  const response = {
    status: 'success',
    message: 'Order details retrieved successfully',
    data: {
      order: {
        order_id: order.order_id,
        user_id: order.user_id,
        status: order.status,
        created_at: order.created_at,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        returned_at: order.returned_at,
        num_of_item: order.num_of_item,
        total_amount: order.total_amount,
        currency: order.currency,
        // Calculate processing times
        order_timeline: {
          processing_days: order.shipped_at && order.created_at ? 
            Math.ceil((new Date(order.shipped_at) - new Date(order.created_at)) / (1000 * 60 * 60 * 24)) : null,
          delivery_days: order.delivered_at && order.shipped_at ? 
            Math.ceil((new Date(order.delivered_at) - new Date(order.shipped_at)) / (1000 * 60 * 60 * 24)) : null,
          total_fulfillment_days: order.delivered_at && order.created_at ? 
            Math.ceil((new Date(order.delivered_at) - new Date(order.created_at)) / (1000 * 60 * 60 * 24)) : null
        }
      }
    }
  };

  // Include customer details if requested
  if (include_customer === 'true') {
    const customer = await User.findOne({ user_id: order.user_id }).lean();
    if (customer) {
      response.data.customer = {
        user_id: customer.user_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        location: customer.location,
        traffic_source: customer.traffic_source,
        created_at: customer.created_at
      };
    }
  }

  // Log the request
  logger.info(`Retrieved order details for order_id: ${orderId}`);

  res.status(httpStatus.OK).json(response);
});

/**
 * Get order statistics and analytics
 * @route GET /api/v1/orders/stats
 * @access Public
 */
const getOrderStats = catchAsync(async (req, res) => {
  const { period = 'monthly' } = req.query;

  try {
    // Get basic counts
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments();

    // Order status distribution
    const statusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total_amount: { $sum: '$total_amount' } } },
      { $sort: { count: -1 } }
    ]);

    // Revenue by period
    const periodFormat = {
      daily: '%Y-%m-%d',
      weekly: '%Y-W%U',
      monthly: '%Y-%m'
    };

    const revenueByPeriod = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: periodFormat[period], date: '$created_at' } },
          order_count: { $sum: 1 },
          total_revenue: { $sum: '$total_amount' },
          total_items: { $sum: '$num_of_item' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Average order metrics
    const orderMetrics = await Order.aggregate([
      {
        $group: {
          _id: null,
          avg_order_value: { $avg: '$total_amount' },
          avg_items_per_order: { $avg: '$num_of_item' },
          total_revenue: { $sum: '$total_amount' },
          max_order_value: { $max: '$total_amount' },
          min_order_value: { $min: '$total_amount' }
        }
      }
    ]);

    const metrics = orderMetrics[0] || {
      avg_order_value: 0,
      avg_items_per_order: 0,
      total_revenue: 0,
      max_order_value: 0,
      min_order_value: 0
    };

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Order statistics retrieved successfully',
      data: {
        overview: {
          total_orders: totalOrders,
          total_customers: totalCustomers,
          total_revenue: Math.round(metrics.total_revenue * 100) / 100,
          average_order_value: Math.round(metrics.avg_order_value * 100) / 100,
          average_items_per_order: Math.round(metrics.avg_items_per_order * 100) / 100,
          max_order_value: metrics.max_order_value,
          min_order_value: metrics.min_order_value
        },
        order_distribution: {
          by_status: statusStats,
          by_period: revenueByPeriod
        },
        period: period
      }
    });

  } catch (error) {
    logger.error('Error in getOrderStats:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving order statistics');
  }
});

/**
 * Get order fulfillment analytics
 * @route GET /api/v1/orders/fulfillment
 * @access Public
 */
const getOrderFulfillment = catchAsync(async (req, res) => {
  try {
    // Calculate fulfillment metrics
    const fulfillmentStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['Shipped', 'Delivered'] },
          shipped_at: { $ne: null },
          created_at: { $ne: null }
        }
      },
      {
        $addFields: {
          processing_time_days: {
            $divide: [
              { $subtract: ['$shipped_at', '$created_at'] },
              1000 * 60 * 60 * 24
            ]
          },
          delivery_time_days: {
            $cond: {
              if: { $and: ['$delivered_at', '$shipped_at'] },
              then: {
                $divide: [
                  { $subtract: ['$delivered_at', '$shipped_at'] },
                  1000 * 60 * 60 * 24
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avg_processing_time: { $avg: '$processing_time_days' },
          avg_delivery_time: { $avg: '$delivery_time_days' },
          min_processing_time: { $min: '$processing_time_days' },
          max_processing_time: { $max: '$processing_time_days' },
          orders_shipped: { $sum: 1 }
        }
      }
    ]);

    const fulfillment = fulfillmentStats[0] || {
      avg_processing_time: 0,
      avg_delivery_time: 0,
      min_processing_time: 0,
      max_processing_time: 0,
      orders_shipped: 0
    };

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Order fulfillment analytics retrieved successfully',
      data: {
        fulfillment_metrics: {
          average_processing_time_days: Math.round(fulfillment.avg_processing_time * 10) / 10,
          average_delivery_time_days: Math.round(fulfillment.avg_delivery_time * 10) / 10,
          fastest_processing_days: Math.round(fulfillment.min_processing_time * 10) / 10,
          slowest_processing_days: Math.round(fulfillment.max_processing_time * 10) / 10,
          total_orders_shipped: fulfillment.orders_shipped
        }
      }
    });

  } catch (error) {
    logger.error('Error in getOrderFulfillment:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving fulfillment analytics');
  }
});

module.exports = {
  getAllOrders,
  getOrdersByCustomer,
  getOrderById,
  getOrderStats,
  getOrderFulfillment
};
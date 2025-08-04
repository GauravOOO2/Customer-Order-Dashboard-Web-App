// src/controllers/customerController.js
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPaginationOptions, getPaginationMetadata } = require('../utils/pagination');
const logger = require('../utils/logger');

/**
 * Get all customers with pagination, search, and filters
 * @route GET /api/v1/customers
 * @access Public
 */
const getAllCustomers = catchAsync(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation Error', errors.array());
  }

  const {
    page = 1,
    limit = 20,
    search = '',
    state = '',
    city = '',
    gender = '',
    traffic_source = '',
    sort_by = 'created_at',
    sort_order = 'desc',
    min_age = '',
    max_age = '',
    country = ''
  } = req.query;

  // Build query object
  const query = {};

  // Search functionality (name, email)
  if (search) {
    query.$or = [
      { first_name: { $regex: search, $options: 'i' } },
      { last_name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by location
  if (state) query['location.state'] = { $regex: state, $options: 'i' };
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (country) query['location.country'] = { $regex: country, $options: 'i' };

  // Filter by demographics
  if (gender) query.gender = gender;
  if (traffic_source) query.traffic_source = traffic_source;

  // Age range filter
  if (min_age || max_age) {
    query.age = {};
    if (min_age) query.age.$gte = parseInt(min_age);
    if (max_age) query.age.$lte = parseInt(max_age);
  }

  // Pagination options
  const { skip, limitNum } = getPaginationOptions(page, limit);

  // Sort options
  const sortOrder = sort_order === 'desc' ? -1 : 1;
  const sortOptions = { [sort_by]: sortOrder };

  // Execute query with aggregation to include order count
  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'orders',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'orders'
      }
    },
    {
      $addFields: {
        order_count: { $size: '$orders' },
        total_orders_value: { $sum: '$orders.total_amount' },
        latest_order_date: { $max: '$orders.created_at' }
      }
    },
    { $unset: 'orders' }, // Remove orders array to reduce payload size
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: limitNum }
  ];

  const [customers, totalCount] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments(query)
  ]);

  // Get pagination metadata
  const pagination = getPaginationMetadata(totalCount, page, limitNum);

  // Log the request
  logger.info(`Retrieved ${customers.length} customers`, {
    page: pagination.current_page,
    total: totalCount,
    filters: { search, state, city, gender, traffic_source }
  });

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Customers retrieved successfully',
    data: {
      customers,
      pagination,
      filters: {
        search: search || null,
        state: state || null,
        city: city || null,
        gender: gender || null,
        traffic_source: traffic_source || null,
        age_range: {
          min: min_age || null,
          max: max_age || null
        }
      }
    }
  });
});

/**
 * Get specific customer details with order information
 * @route GET /api/v1/customers/:id
 * @access Public
 */
const getCustomerById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { include_orders = 'true', orders_limit = 10 } = req.query;

  // Validate ID
  if (!id || isNaN(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid customer ID');
  }

  const userId = parseInt(id);

  // Find customer
  const customer = await User.findOne({ user_id: userId });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  // Get customer with additional details
  const customerDetails = await User.aggregate([
    { $match: { user_id: userId } },
    {
      $lookup: {
        from: 'orders',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'orders'
      }
    },
    {
      $addFields: {
        order_count: { $size: '$orders' },
        total_spent: { $sum: '$orders.total_amount' },
        total_items_purchased: { $sum: '$orders.num_of_item' },
        latest_order_date: { $max: '$orders.created_at' },
        first_order_date: { $min: '$orders.created_at' },
        order_statuses: {
          pending: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Pending'] }
              }
            }
          },
          processing: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Processing'] }
              }
            }
          },
          shipped: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Shipped'] }
              }
            }
          },
          delivered: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Delivered'] }
              }
            }
          },
          cancelled: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Cancelled'] }
              }
            }
          },
          returned: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$this.status', 'Returned'] }
              }
            }
          }
        }
      }
    }
  ]);

  if (!customerDetails.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const customerData = customerDetails[0];

  // Prepare response
  const response = {
    status: 'success',
    message: 'Customer details retrieved successfully',
    data: {
      customer: {
        user_id: customerData.user_id,
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        full_name: `${customerData.first_name} ${customerData.last_name}`,
        email: customerData.email,
        age: customerData.age,
        gender: customerData.gender,
        location: customerData.location,
        traffic_source: customerData.traffic_source,
        created_at: customerData.created_at,
        order_summary: {
          total_orders: customerData.order_count,
          total_spent: customerData.total_spent || 0,
          total_items_purchased: customerData.total_items_purchased || 0,
          average_order_value: customerData.order_count > 0 
            ? (customerData.total_spent || 0) / customerData.order_count 
            : 0,
          latest_order_date: customerData.latest_order_date,
          first_order_date: customerData.first_order_date,
          order_statuses: customerData.order_statuses
        }
      }
    }
  };

  // Include recent orders if requested
  if (include_orders === 'true') {
    const recentOrders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(parseInt(orders_limit))
      .select('-_id -__v');

    response.data.recent_orders = recentOrders;
  }

  // Log the request
  logger.info(`Retrieved customer details for user_id: ${userId}`);

  res.status(httpStatus.OK).json(response);
});

/**
 * Get customer statistics and analytics
 * @route GET /api/v1/customers/stats
 * @access Public
 */
const getCustomerStats = catchAsync(async (req, res) => {
  const { period = 'monthly' } = req.query;

  // Get overall statistics
  const [
    totalCustomers,
    genderStats,
    stateStats,
    trafficSourceStats,
    ageStats,
    registrationTrends
  ] = await Promise.all([
    // Total customers
    User.countDocuments(),

    // Gender distribution
    User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Top states
    User.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    // Traffic source distribution
    User.aggregate([
      { $group: { _id: '$traffic_source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Age distribution
    User.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: '18-24' },
                { case: { $lt: ['$age', 35] }, then: '25-34' },
                { case: { $lt: ['$age', 45] }, then: '35-44' },
                { case: { $lt: ['$age', 55] }, then: '45-54' },
                { case: { $lt: ['$age', 65] }, then: '55-64' }
              ],
              default: '65+'
            }
          },
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Registration trends
    User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { 
              format: period === 'daily' ? '%Y-%m-%d' : 
                      period === 'weekly' ? '%Y-W%U' : '%Y-%m',
              date: '$created_at' 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ])
  ]);

  // Customer lifetime value calculation
  const customerLTVStats = await User.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'orders'
      }
    },
    {
      $addFields: {
        order_count: { $size: '$orders' },
        total_spent: { $sum: '$orders.total_amount' }
      }
    },
    {
      $group: {
        _id: null,
        avgOrdersPerCustomer: { $avg: '$order_count' },
        avgLifetimeValue: { $avg: '$total_spent' },
        customersWithOrders: {
          $sum: { $cond: [{ $gt: ['$order_count', 0] }, 1, 0] }
        }
      }
    }
  ]);

  const ltvData = customerLTVStats[0] || {
    avgOrdersPerCustomer: 0,
    avgLifetimeValue: 0,
    customersWithOrders: 0
  };

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Customer statistics retrieved successfully',
    data: {
      overview: {
        total_customers: totalCustomers,
        customers_with_orders: ltvData.customersWithOrders,
        average_orders_per_customer: Math.round(ltvData.avgOrdersPerCustomer * 100) / 100,
        average_lifetime_value: Math.round(ltvData.avgLifetimeValue * 100) / 100
      },
      demographics: {
        gender_distribution: genderStats,
        age_distribution: ageStats,
        top_states: stateStats,
        traffic_sources: trafficSourceStats
      },
      trends: {
        registration_trends: registrationTrends,
        period: period
      }
    }
  });
});

/**
 * Search customers with advanced filters
 * @route POST /api/v1/customers/search
 * @access Public
 */
const searchCustomers = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation Error', errors.array());
  }

  const {
    query: searchQuery = '',
    filters = {},
    sort = { field: 'created_at', order: 'desc' },
    page = 1,
    limit = 20
  } = req.body;

  // Build MongoDB query
  const mongoQuery = {};

  // Text search
  if (searchQuery) {
    mongoQuery.$or = [
      { first_name: { $regex: searchQuery, $options: 'i' } },
      { last_name: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  // Apply filters
  if (filters.states && filters.states.length > 0) {
    mongoQuery['location.state'] = { $in: filters.states };
  }

  if (filters.cities && filters.cities.length > 0) {
    mongoQuery['location.city'] = { $in: filters.cities };
  }

  if (filters.genders && filters.genders.length > 0) {
    mongoQuery.gender = { $in: filters.genders };
  }

  if (filters.traffic_sources && filters.traffic_sources.length > 0) {
    mongoQuery.traffic_source = { $in: filters.traffic_sources };
  }

  if (filters.age_range) {
    mongoQuery.age = {};
    if (filters.age_range.min) mongoQuery.age.$gte = filters.age_range.min;
    if (filters.age_range.max) mongoQuery.age.$lte = filters.age_range.max;
  }

  if (filters.date_range) {
    mongoQuery.created_at = {};
    if (filters.date_range.start) mongoQuery.created_at.$gte = new Date(filters.date_range.start);
    if (filters.date_range.end) mongoQuery.created_at.$lte = new Date(filters.date_range.end);
  }

  // Pagination
  const { skip, limitNum } = getPaginationOptions(page, limit);

  // Sort
  const sortOptions = { [sort.field]: sort.order === 'desc' ? -1 : 1 };

  // Execute search
  const [customers, totalCount] = await Promise.all([
    User.aggregate([
      { $match: mongoQuery },
      {
        $lookup: {
          from: 'orders',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'orders'
        }
      },
      {
        $addFields: {
          order_count: { $size: '$orders' },
          total_spent: { $sum: '$orders.total_amount' }
        }
      },
      { $unset: 'orders' },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNum }
    ]),
    User.countDocuments(mongoQuery)
  ]);

  // Pagination metadata
  const pagination = getPaginationMetadata(totalCount, page, limitNum);

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Customer search completed successfully',
    data: {
      customers,
      pagination,
      search_query: searchQuery,
      applied_filters: filters,
      sort_options: sort
    }
  });
});

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerStats,
  searchCustomers
};
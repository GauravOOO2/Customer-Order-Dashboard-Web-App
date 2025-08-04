// src/routes/customerRoutes.js
const express = require('express');
const { body, query, param } = require('express-validator');
const customerController = require('../controllers/customerController');
const config = require('../config/config');

const router = express.Router();

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers with pagination, search, and filters
 * @access  Public
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: config.maxPageSize })
      .withMessage(`Limit must be between 1 and ${config.maxPageSize}`),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search query must be a string with max 100 characters'),
    query('state')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('State must be a string with max 50 characters'),
    query('city')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('City must be a string with max 50 characters'),
    query('country')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Country must be a string with max 50 characters'),
    query('gender')
      .optional()
      .isIn(['M', 'F', 'Other'])
      .withMessage('Gender must be M, F, or Other'),
    query('traffic_source')
      .optional()
      .isIn(['Search', 'Email', 'Social', 'Direct', 'Referral', 'Paid'])
      .withMessage('Invalid traffic source'),
    query('sort_by')
      .optional()
      .isIn(['created_at', 'first_name', 'last_name', 'email', 'age'])
      .withMessage('Invalid sort field'),
    query('sort_order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('min_age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Minimum age must be between 0 and 150'),
    query('max_age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Maximum age must be between 0 and 150'),
  ],
  customerController.getAllCustomers
);

/**
 * @route   GET /api/v1/customers/stats
 * @desc    Get customer statistics and analytics
 * @access  Public
 */
router.get(
  '/stats',
  [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Period must be daily, weekly, or monthly'),
  ],
  customerController.getCustomerStats
);

/**
 * @route   POST /api/v1/customers/search
 * @desc    Advanced customer search with filters
 * @access  Public
 */
router.post(
  '/search',
  [
    body('query')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search query must be a string with max 100 characters'),
    body('filters')
      .optional()
      .isObject()
      .withMessage('Filters must be an object'),
    body('filters.states')
      .optional()
      .isArray()
      .withMessage('States must be an array'),
    body('filters.cities')
      .optional()
      .isArray()
      .withMessage('Cities must be an array'),
    body('filters.genders')
      .optional()
      .isArray()
      .withMessage('Genders must be an array'),
    body('filters.traffic_sources')
      .optional()
      .isArray()
      .withMessage('Traffic sources must be an array'),
    body('filters.age_range')
      .optional()
      .isObject()
      .withMessage('Age range must be an object'),
    body('filters.age_range.min')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Minimum age must be between 0 and 150'),
    body('filters.age_range.max')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Maximum age must be between 0 and 150'),
    body('filters.date_range')
      .optional()
      .isObject()
      .withMessage('Date range must be an object'),
    body('filters.date_range.start')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    body('filters.date_range.end')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    body('sort')
      .optional()
      .isObject()
      .withMessage('Sort must be an object'),
    body('sort.field')
      .optional()
      .isIn(['created_at', 'first_name', 'last_name', 'email', 'age', 'order_count', 'total_spent'])
      .withMessage('Invalid sort field'),
    body('sort.order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    body('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: config.maxPageSize })
      .withMessage(`Limit must be between 1 and ${config.maxPageSize}`),
  ],
  customerController.searchCustomers
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get specific customer details
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    query('include_orders')
      .optional()
      .isBoolean()
      .withMessage('Include orders must be a boolean'),
    query('orders_limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Orders limit must be between 1 and 50'),
  ],
  customerController.getCustomerById
);

module.exports = router;
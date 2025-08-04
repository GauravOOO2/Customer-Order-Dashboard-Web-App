// src/routes/orderRoutes.js
const express = require('express');
const { query, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const config = require('../config/config');

const router = express.Router();

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with pagination and filters
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
    query('status')
      .optional()
      .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'])
      .withMessage('Invalid order status'),
    query('user_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    query('sort_by')
      .optional()
      .isIn(['created_at', 'order_id', 'status', 'total_amount', 'num_of_item'])
      .withMessage('Invalid sort field'),
    query('sort_order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO 8601 date'),
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO 8601 date'),
    query('min_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum amount must be a positive number'),
    query('max_amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum amount must be a positive number'),
  ],
  orderController.getAllOrders
);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
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
  orderController.getOrderStats
);

/**
 * @route   GET /api/v1/orders/fulfillment
 * @desc    Get order fulfillment analytics
 * @access  Public
 */
router.get('/fulfillment', orderController.getOrderFulfillment);

/**
 * @route   GET /api/v1/orders/customer/:user_id
 * @desc    Get all orders for a specific customer
 * @access  Public
 */
router.get(
  '/customer/:user_id',
  [
    param('user_id')
      .isInt({ min: 1 })
      .withMessage('Customer ID must be a positive integer'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: config.maxPageSize })
      .withMessage(`Limit must be between 1 and ${config.maxPageSize}`),
    query('status')
      .optional()
      .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'])
      .withMessage('Invalid order status'),
    query('sort_by')
      .optional()
      .isIn(['created_at', 'order_id', 'status', 'total_amount'])
      .withMessage('Invalid sort field'),
    query('sort_order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
  ],
  orderController.getOrdersByCustomer
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get specific order details
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Order ID must be a positive integer'),
    query('include_customer')
      .optional()
      .isBoolean()
      .withMessage('Include customer must be a boolean'),
  ],
  orderController.getOrderById
);

module.exports = router;
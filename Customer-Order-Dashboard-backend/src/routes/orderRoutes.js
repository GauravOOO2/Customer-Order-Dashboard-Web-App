// src/routes/orderRoutes.js
const express = require('express');
const { query, param } = require('express-validator');
const config = require('../config/config');

const router = express.Router();

// Placeholder controller functions (to be implemented later)
const orderController = {
  getAllOrders: (req, res) => {
    res.json({
      status: 'success',
      message: 'Orders endpoint - coming soon',
      data: []
    });
  },
  getOrderById: (req, res) => {
    res.json({
      status: 'success',
      message: 'Order details endpoint - coming soon',
      data: {}
    });
  },
  getOrderStats: (req, res) => {
    res.json({
      status: 'success',
      message: 'Order statistics endpoint - coming soon',
      data: {}
    });
  }
};

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
  ],
  orderController.getAllOrders
);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Public
 */
router.get('/stats', orderController.getOrderStats);

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
  ],
  orderController.getOrderById
);

module.exports = router;
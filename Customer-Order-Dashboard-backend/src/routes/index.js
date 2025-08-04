// src/routes/index.js
const express = require('express');
const customerRoutes = require('./customerRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Customer Order Dashboard API',
    version: '1.0.0',
    endpoints: {
      customers: {
        'GET /customers': 'Get all customers with pagination and filters',
        'GET /customers/:id': 'Get specific customer details',
        'GET /customers/stats': 'Get customer statistics',
        'POST /customers/search': 'Advanced customer search'
      },
      orders: {
        'GET /orders': 'Get all orders with pagination and filters',
        'GET /orders/:id': 'Get specific order details',
        'GET /orders/stats': 'Get order statistics'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    },
    documentation: {
      swagger: '/api-docs',
      postman: 'Available on request'
    }
  });
});

// Mount route modules
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
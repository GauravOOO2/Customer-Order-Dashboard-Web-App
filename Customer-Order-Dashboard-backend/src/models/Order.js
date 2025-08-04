// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
    index: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Other']
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  returned_at: {
    type: Date,
    default: null
  },
  shipped_at: {
    type: Date,
    default: null
  },
  delivered_at: {
    type: Date,
    default: null
  },
  num_of_item: {
    type: Number,
    default: 1,
    min: 1
  },
  // Additional fields that might be useful
  total_amount: {
    type: Number,
    min: 0,
    default: 50 // Default price per item
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  }
}, {
  timestamps: true,
  collection: 'orders' // Explicitly set collection name
});

// Create the model and export it
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
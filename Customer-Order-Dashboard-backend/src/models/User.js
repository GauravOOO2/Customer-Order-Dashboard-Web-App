// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Other'],
    index: true
  },
  location: {
    state: {
      type: String,
      trim: true,
      index: true
    },
    street_address: {
      type: String,
      trim: true
    },
    postal_code: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true,
      index: true
    },
    country: {
      type: String,
      trim: true,
      index: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  traffic_source: {
    type: String,
    enum: ['Search', 'Email', 'Social', 'Direct', 'Referral', 'Paid'],
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'users' // Explicitly set collection name
});

// Create the model and export it
const User = mongoose.model('User', userSchema);

module.exports = User;
// src/config/database.js
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// MongoDB connection options (updated for newer Mongoose versions)
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const connectionString = `${config.mongodbUri}${config.databaseName}?retryWrites=true&w=majority`;
    
    logger.info('🔌 Connecting to MongoDB...');
    logger.info(`Connection string: ${connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in log
    
    await mongoose.connect(connectionString, options);
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    if (config.nodeEnv === 'development') {
      mongoose.set('debug', false); // Set to true for query debugging
    }
    
    // Set up connection event listeners AFTER successful connection
    mongoose.connection.on('connected', () => {
      logger.info('📊 MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    logger.info('✅ Database connection established successfully');
    
  } catch (error) {
    logger.error('💥 Failed to connect to MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    process.exit(1);
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('🔒 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

/**
 * Check database connection status
 * @returns {boolean}
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database connection info
 * @returns {object}
 */
const getConnectionInfo = () => {
  const { readyState, host, port, name } = mongoose.connection;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[readyState],
    host,
    port,
    database: name,
    readyState
  };
};

module.exports = {
  connectDB,
  closeDB,
  isConnected,
  getConnectionInfo
};
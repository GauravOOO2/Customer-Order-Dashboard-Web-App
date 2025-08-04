// src/config/config.js
require('dotenv').config();
const Joi = require('joi');

// Validation schema for environment variables
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5000),
    HOST: Joi.string().default('localhost'),
    MONGODB_URI: Joi.string().required().description('MongoDB connection URI'),
    DATABASE_NAME: Joi.string().required().description('Database name'),
    USERS_COLLECTION: Joi.string().default('users'),
    ORDERS_COLLECTION: Joi.string().default('orders'),
    API_VERSION: Joi.string().default('v1'),
    BASE_URL: Joi.string().default('/api/v1'),
    DEFAULT_PAGE_SIZE: Joi.number().integer().min(1).max(100).default(20),
    MAX_PAGE_SIZE: Joi.number().integer().min(1).max(1000).default(100),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
    JWT_SECRET: Joi.string().min(32).description('JWT secret key'),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).max(15).default(12),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    LOG_FORMAT: Joi.string().default('combined'),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  })
  .unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  // Server
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  
  // Database
  mongodbUri: envVars.MONGODB_URI,
  databaseName: envVars.DATABASE_NAME,
  usersCollection: envVars.USERS_COLLECTION,
  ordersCollection: envVars.ORDERS_COLLECTION,
  
  // API
  apiVersion: envVars.API_VERSION,
  baseUrl: envVars.BASE_URL,
  
  // Pagination
  defaultPageSize: envVars.DEFAULT_PAGE_SIZE,
  maxPageSize: envVars.MAX_PAGE_SIZE,
  
  // Rate Limiting
  rateLimitWindowMs: envVars.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  
  // Security
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  
  // Logging
  logLevel: envVars.LOG_LEVEL,
  logFormat: envVars.LOG_FORMAT,
  
  // CORS
  corsOrigin: envVars.CORS_ORIGIN,
  
  // CSV paths (for data loading)
  usersCsvPath: envVars.USERS_CSV_PATH,
  ordersCsvPath: envVars.ORDERS_CSV_PATH,
};
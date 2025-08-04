// src/middleware/errorMiddleware.js
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * Handle MongoDB validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));
  
  return new ApiError(httpStatus.BAD_REQUEST, 'Validation Error', true, null, errors);
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  
  return new ApiError(httpStatus.CONFLICT, message);
};

/**
 * Handle MongoDB cast errors
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(httpStatus.BAD_REQUEST, message);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token. Please log in again');
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new ApiError(httpStatus.UNAUTHORIZED, 'Your token has expired. Please log in again');
};

/**
 * Enhanced error converter middleware
 * Converts other errors to ApiError instances
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  // Handle specific MongoDB errors
  if (error.name === 'ValidationError') {
    error = handleValidationError(error);
  } else if (error.code === 11000) {
    error = handleDuplicateKeyError(error);
  } else if (error.name === 'CastError') {
    error = handleCastError(error);
  } else if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (error.name === 'MongoNetworkError') {
    error = new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Database connection error');
  } else if (error.name === 'MongoTimeoutError') {
    error = new ApiError(httpStatus.REQUEST_TIMEOUT, 'Database operation timeout');
  } else if (error.name === 'MongoServerError') {
    error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Database server error');
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 
                      (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Global error handler middleware
 * Sends error response to client
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // Don't expose internal errors in production
  if (config.nodeEnv === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  // Log error details
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  const errorDetails = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    statusCode,
    message: err.message,
    stack: err.stack
  };

  // Add request details for debugging (exclude sensitive data)
  if (config.nodeEnv === 'development') {
    errorDetails.body = req.body;
    errorDetails.query = req.query;
    errorDetails.params = req.params;
  }

  logger[logLevel](`${statusCode} - ${message}`, errorDetails);

  // Prepare error response
  const response = {
    status: 'error',
    code: statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add validation errors if they exist
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  // Add request ID if available (useful for debugging)
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors - Route not found
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  const error = new ApiError(httpStatus.NOT_FOUND, message);
  next(error);
};

/**
 * Handle async errors in development
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Add request context to error
      err.requestContext = {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
      };
      next(err);
    });
  };
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason.message || reason,
    stack: reason.stack,
    promise: promise
  });
  
  // In production, you might want to gracefully shutdown
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  
  // Gracefully shutdown
  process.exit(1);
};

/**
 * Setup global error handlers
 */
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};

/**
 * Send error response for API errors
 */
const sendErrorResponse = (res, error) => {
  const { statusCode, message } = error;
  
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Validation error formatter
 */
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value,
    location: error.location
  }));
};

module.exports = {
  errorConverter,
  errorHandler,
  notFound,
  asyncErrorHandler,
  setupGlobalErrorHandlers,
  sendErrorResponse,
  formatValidationErrors,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError,
  handleJWTExpiredError
};
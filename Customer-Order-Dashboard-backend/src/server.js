// src/server.js
require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 Server running on ${config.host}:${config.port} in ${config.nodeEnv} mode`);
  logger.info(`📊 API Base URL: ${config.host}:${config.port}${config.baseUrl}`);
  logger.info(`🔗 Health Check: ${config.host}:${config.port}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    logger.info('Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
// src/server.js
require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const { findAvailablePort } = require('./utils/portUtils');

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

// Start server with automatic port detection
const startServer = async () => {
  try {
    let port = config.port;
    
    // Try to find an available port if the configured port is busy
    try {
      port = await findAvailablePort(config.port, 10);
      if (port !== config.port) {
        logger.info(`📍 Port ${config.port} was busy, using port ${port} instead`);
      }
    } catch (error) {
      logger.error(`❌ Could not find an available port: ${error.message}`);
      process.exit(1);
    }

    const server = app.listen(port, config.host, () => {
      logger.info(`🚀 Server running on ${config.host}:${port} in ${config.nodeEnv} mode`);
      logger.info(`📊 API Base URL: ${config.host}:${port}${config.baseUrl}`);
      logger.info(`🔗 Health Check: ${config.host}:${port}/health`);
      
      if (port !== config.port) {
        logger.info(`💡 Update your frontend .env file: VITE_API_BASE_URL=http://localhost:${port}`);
      }
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${port} is still in use even after detection.`);
        logger.error(`   💡 Try running: node kill-port.js ${port}`);
        process.exit(1);
      } else {
        logger.error('Server error:', err);
        process.exit(1);
      }
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

    return server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});

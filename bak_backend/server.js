import 'dotenv/config';

import app from './app.js';
import { config } from './config.js';
import logger from './logger.js'; 

let server;
const startServer = () => {
  server = app.listen(config.PORT, config.HOST, () => {
    logger.info(`Server is running on http://${config.HOST}:${config.PORT}`);
  }).on('error', (err) => {
    logger.error(`❌ Server failed to start: ${err.message}`);
    process.exit(1);
  });
};

const shutdown = (signal) => {
  logger.info(`\n\nReceived signal ${signal}. Shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error('Error during server close:', err.message);
      process.exit(1);
    }

    logger.info('All connections closed. Process terminated successfully.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn('Server shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 1000).unref();
};


// Start server and catch process signals
startServer();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION:', reason);
  logger.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION:', error.message);
  logger.error('Stack:', error.stack);
  shutdown('UncaughtException');
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));   


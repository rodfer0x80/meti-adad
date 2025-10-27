import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config.js';
import logger from './logger.js'; 

const app = express();

/**
 * Middleware
 */

// Add security headers
app.use(helmet());

// Logging
const logFormat = 'combined'
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan(logFormat, { stream: morganStream }));

// Express configs
app.use(express.json());
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    message: {
        error: {
            code: 429,
            message: "Too many requests, please try again after 15 minutes."
        }
    },
    statusCode: 429, 
});
app.use(apiLimiter);

// #TODO: setup DB global const here to use in API endpoints at ./app.js
// Database MongoDB


/**
 * API ROUTES
 */

// Sanity check endpoint
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'METI ADAD Backend',
    host: config.HOST,
    port: config.PORT,
    uptime: process.uptime() + ' seconds',
  });
});

// #NOTE: Use DB accordingly in the endpoints from the global const in ./server.js


/**
 * Error handling 
 */

// Handle 404
app.use((req, res, next) => {
  const error = new Error(`Resource Not Found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});


// Handle 5xx
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';

  if (status >= 500) {
    logger.error(`Server Error [${status}]: ${message}`);
    logger.error(`Client Error: ${err.stack}`);
  } else {
    logger.warn(`Warning: [${status}]: ${message}`);
  }

  res.status(status).json({
    error: {
      code: status,
      message
    },
  });
});





export default app;

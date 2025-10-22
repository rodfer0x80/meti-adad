'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./logger');

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

/**
 * API ROUTES
 */

// Sanity check endpoint
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'METI ADAD Backend',
    host: process.env.HOST,
    port: config.PORT,
    uptime: process.uptime() + ' seconds',
  });
});



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


module.exports = app;

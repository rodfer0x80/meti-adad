// app.js

import express from 'express';

import { config } from './config.js'; // For the /status route
import logger from './logger.js'; // For error handling
import { connectToDatabase, closeDatabaseConnection, checkDatabaseStatus } from './database.js';

import { securityMiddleware } from './middleware/security.js';
import { loggingMiddleware } from './middleware/logging.js';

const { HOST, PORT } = config;

const app = express();

/**
 * Middleware Application
 */
app.use(loggingMiddleware);
app.use(express.json());
app.use(securityMiddleware);


/**
 * API ROUTES
 */

// Sanity check endpoint
app.get('/status', async (req, res) => {
  const databaseStatus = await checkDatabaseStatus();
  
  res.status(200).json({
    status: 'OK',
    service: 'METI ADAD Backend',
    database: databaseStatus.status,
    host: HOST,
    port: PORT,
    uptime: process.uptime() + ' seconds',
  });
});

//const db = getDatabase();
//const collection = db.collection("users");
//const result = await collection.find({}).toArray();


/**
 * Error handling
 */
//#NOTE: Endpoints > 4xx > 5xx

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

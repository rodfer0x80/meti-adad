import express from 'express';

import { config } from './config.js';
import logger from './logger.js'; 
import { securityMiddleware } from './middleware/security.js';
import { loggingMiddleware } from './middleware/logging.js';

import status from './routes/status.js'

import events from './routes/events.js'
import events_search_by_id from './routes/events/search_by_id.js'
import events_delete_by_id from './routes/events/delete_by_id.js'
import events_nearby from './routes/events/nearby.js'

import users from './routes/users.js'
import users_search_by_id from './routes/users/search_by_id.js'
import users_delete_by_id from './routes/users/delete_by_id.js'


// #TODO: remove this
// const { HOST, PORT } = config;

const app = express();

/**
 * Middleware 
 */
app.use(loggingMiddleware);
app.use(express.json());
app.use(securityMiddleware);

/**
 * API ROUTES
 */
app.use("/status", status);

app.use("/events", events);
app.use("/events", events_search_by_id); 
app.use("/events", events_delete_by_id); 
app.use("/events", events_nearby);

app.use("/users", users);
app.use("/users", users_search_by_id);
app.use("/users", users_delete_by_id);

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

'use strict';

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  const logMessage = stack || message;
  const formattedMessage = `${timestamp} [${level.toUpperCase()}]: ${logMessage}`;
  return formattedMessage;
});

// 2. Create the main logger instance
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), // ISO timestamps
    logFormat
  ),
  transports: [
    new winston.transports.Console({
    }),
  ],

  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;

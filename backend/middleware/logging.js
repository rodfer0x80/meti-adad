import morgan from 'morgan';
import logger from '../logger.js'; 

const logFormat = 'combined';

const morganStream = {
    write: (message) => logger.info(message.trim()),
};

export const loggingMiddleware = morgan(logFormat, { stream: morganStream });

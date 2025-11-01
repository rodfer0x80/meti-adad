import express from 'express';

import logger from '../logger.js';
import HTTP_STATUS from '../http_status.js';
import { config } from '../config.js';
import { checkDatabaseStatus } from '../database.js';

const { HOST, PORT } = config;

const router = express.Router();


router.get('/', async (req, res, next) => {
  try {
    const databaseStatus = await checkDatabaseStatus();

    res.status(HTTP_STATUS.OK).json({
      status: 'OK',
      service: 'METI ADAD Backend',
      database: databaseStatus.status,
      host: HOST,
      port: PORT,
      uptime: process.uptime().toFixed(2) + ' seconds',
    });
  } catch (error) {
    logger.error(`Failed to read database status: ${error.message}`);
    error.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    next(error);
  }
});


export default router;

import express from 'express';
import { ObjectId } from 'mongodb';

import logger from "../../logger.js";
import HTTP_STATUS from '../../http_status.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.delete("/:id", async (req, res, next) => {
  const db = getDatabase();
  const eventId = req.params.id;

  if (!ObjectId.isValid(eventId)) {
    const error = new Error(`Invalid event ID format: ${eventId}`);
    error.status = HTTP_STATUS.BAD_REQUEST;
    return next(error);
  }

  try {
    const eventsCollection = db.collection('events');

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      const error = new Error(`Event not found with ID: ${eventId}`);
      error.status = HTTP_STATUS.NOT_FOUND;
      return next(error);
    }

    logger.info(`Successfully deleted event: ${eventId}`);
    res.status(HTTP_STATUS.NO_CONTENT).send() 

  } catch (error) {
    logger.error(`Error deleting event ${eventId}: ${error.message}`);
    next(error);
  }
});


export default router;
import express from 'express';
import { ObjectId } from 'mongodb';

import { getDatabase } from '../../database.js';
import logger from '../../logger.js';


const router = express.Router();


router.delete("/:id", async (req, res, next) => {
  const db = getDatabase();
  const eventId = req.params.id;

  if (!ObjectId.isValid(eventId)) {
    const error = new Error(`Invalid event ID format: ${eventId}`);
    error.status = 400;
    return next(error);
  }

  try {
    const eventsCollection = db.collection('events');

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      const error = new Error(`Event not found with ID: ${eventId}`);
      error.status = 404;
      return next(error);
    }

    logger.info(`Successfully deleted event: ${eventId}`);
    res.status(204).send() 

  } catch (error) {
    logger.error(`Error deleting event ${eventId}: ${error.message}`);
    next(error);
  }
});


export default router;
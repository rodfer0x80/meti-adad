import express from 'express';
import { ObjectId } from 'mongodb';

import logger from '../../logger.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.delete("/:id", async (req, res, next) => {
  const db = getDatabase();
  const userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
    const error = new Error(`Invalid user ID format: ${userId}`);
    error.status = 400; 
    return next(error);
  }

  try {
    const usersCollection = db.collection('users');

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      const error = new Error(`User not found with ID: ${userId}`);
      error.status = 404;
      return next(error);
    }

    logger.info(`Successfully deleted user: ${userId}`);
    res.status(204).send() 

  } catch (error) {
    logger.error(`Error deleting user ${userId}: ${error.message}`);
    next(error); // Pass to the global error handler
  }
});


export default router;
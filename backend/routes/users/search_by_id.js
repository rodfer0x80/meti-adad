import express from 'express';
import { ObjectId } from 'mongodb';

import logger from '../../logger.js';
import HTTP_STATUS from '../../http_status.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.get("/:id", async (req, res, next) => {
  const db = getDatabase();
  const userId = req.params.id;

  if (!ObjectId.isValid(userId)) {
    const error = new Error(`Invalid user ID format: ${userId}`);
    error.status = HTTP_STATUS.BAD_REQUEST; 
    return next(error);
  }

  try {
    const usersCollection = db.collection('users');
    const eventsCollection = db.collection('events');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      const error = new Error(`User not found with ID: ${userId}`);
      error.status = HTTP_STATUS.NOT_FOUND; 
      return next(error);
    }

    const topScores = user.event_scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topEventIds = topScores.map(score => score.event_id);

    const topEvents = await eventsCollection.find(
      { id: { $in: topEventIds } },
      { projection: { id: 1, _id: 1 } }
    ).toArray();

    const topRatedEvents = topScores.map(scoreItem => {
      const eventDetail = topEvents.find(event => event.id === scoreItem.event_id);

      if (eventDetail) {
        return {
          _id: eventDetail._id.toHexString(),
          user_score: scoreItem.score,
        };
      }
      return null;
    }).filter(item => item !== null); 

    const responseUser = {
      ...user,
      event_scores: undefined, 
      top_rated_events: topRatedEvents
    };

    res.status(HTTP_STATUS.OK).json(responseUser);

  } catch (error) {
    logger.error(`Error fetching user ${userId}: ${error.message}`);
    next(error);
  }
});


export default router;
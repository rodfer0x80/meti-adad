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

    // 1. Get Top 3 Scores
    // Safety check: ensure event_scores exists before sorting
    const scores = user.event_scores || [];
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 2. Convert string IDs to MongoDB ObjectIds
    const topEventIds = topScores.map(score => new ObjectId(score.event_id));

    // 3. Fetch Event Details (Query by _id, not id)
    const topEvents = await eventsCollection.find(
      { _id: { $in: topEventIds } },
      { projection: { nome_atividade: 1, tipologia: 1, _id: 1 } } // Fetch Name and Type
    ).toArray();

    // 4. Merge Score with Event Details
    const topRatedEvents = topScores.map(scoreItem => {
      // Compare as strings to ensure match
      const eventDetail = topEvents.find(event => event._id.toString() === scoreItem.event_id);

      if (eventDetail) {
        return {
          event_id: eventDetail._id.toString(),
          nome_atividade: eventDetail.nome_atividade, // Now available!
          tipologia: eventDetail.tipologia,
          score: scoreItem.score,
        };
      }
      return null;
    }).filter(item => item !== null); 

    const responseUser = {
      ...user,
      // event_scores: undefined, // REMOVED: Keep this so the frontend list works!
      top_rated_events: topRatedEvents
    };

    res.status(HTTP_STATUS.OK).json(responseUser);

  } catch (error) {
    logger.error(`Error fetching user ${userId}: ${error.message}`);
    next(error);
  }
});

export default router;

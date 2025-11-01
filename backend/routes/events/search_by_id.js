import { ObjectId } from "mongodb";
import express from 'express';

import logger from "../../logger.js";
import HTTP_STATUS from '../../http_status.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.get("/:id", async (req, res, next) => {
  const db = getDatabase();
  const mongoIdParam = req.params.id;

  if (!ObjectId.isValid(mongoIdParam)) {
    const error = new Error(`Invalid MongoDB ObjectId format: ${mongoIdParam}`);
    error.status = HTTP_STATUS.BAD_REQUEST;
    return next(error);
  }

  const objectId = new ObjectId(mongoIdParam);

  try {
    const event = await db.collection('events').findOne({ _id: objectId });

    if (!event) {
      const error = new Error(`Event not found with _id: ${mongoIdParam}`);
      error.status = HTTP_STATUS.NOT_FOUND;
      return next(error);
    }

    const customEventIdForScores = event.id;

    const scoreAggregationPipeline = [
      {
        $unwind: "$event_scores"
      },
      {
        $match: { "event_scores.event_id": customEventIdForScores }
      },
      {
        $group: {
          _id: null,
          average_score: { $avg: "$event_scores.score" }
        }
      }
    ];

    const scoreResult = await db.collection('users').aggregate(scoreAggregationPipeline).toArray();

    const averageScore = scoreResult.length > 0 ? scoreResult[0].average_score : 0;

    const finalOutput = {
      ...event,
      _id: event._id.toString(),
      average_score: averageScore
    };

    res.status(HTTP_STATUS.OK).json(finalOutput);

  } catch (error) {
    logger.error(`Error fetching event by _id ${mongoIdParam} and calculating score:`, error.message);
    next(error);
  }
});


export default router;
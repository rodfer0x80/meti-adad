import express from "express";
import { ObjectId } from "mongodb";

import logger from '../../logger.js';
import HTTP_STATUS from '../../http_status.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.post("/:id/review/:event_id", async (req, res, next) => {
  const db = getDatabase();
  const { id, event_id } = req.params;
  const { score } = req.query;

  try {
    if (!ObjectId.isValid(id)) {
      const err = new Error(`Invalid user _id format: ${id}`);
      err.status = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      const err = new Error(`Invalid score: ${score}. Must be between 1 and 5.`);
      err.status = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      const err = new Error(`User not found with _id: ${id}`);
      err.status = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const event = await eventsCollection.findOne({
      $or: [
        { id: event_id },
        { id: parseInt(event_id, 10) }
      ]
    });
    if (!event) {
      const err = new Error(`Event not found with id: ${event_id}`);
      err.status = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const eventIdStr = event_id.toString();

    const existingReview = user.event_scores?.find(
      (entry) => entry.event_id.toString() === eventIdStr
    );

    if (existingReview) {
      await usersCollection.updateOne(
        { _id: user._id, "event_scores.event_id": existingReview.event_id },
        { $set: { "event_scores.$.score": parsedScore } }
      );
      logger.info(
        `Updated existing review: user ${id}, event ${eventIdStr}, score ${parsedScore}`
      );
      res.status(HTTP_STATUS.OK).json({
        message: `Updated score for event ${eventIdStr} to ${parsedScore}.`,
      });
    } else {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $push: {
            event_scores: { event_id: eventIdStr, score: parsedScore },
          },
        }
      );
      logger.info(
        `Added new review: user ${id}, event ${eventIdStr}, score ${parsedScore}`
      );
      res.status(HTTP_STATUS.CREATED).json({
        message: `Added new review for event ${eventIdStr} with score ${parsedScore}.`,
      });
    }
  } catch (error) {
    logger.error(`Error adding/updating review: ${error.message}`);
    next(error);
  }
});


export default router;
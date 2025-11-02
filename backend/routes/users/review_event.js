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

    if (!ObjectId.isValid(event_id)) {
      const err = new Error(`Invalid event _id format: ${event_id}`);
      err.status = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
    const eventObjectId = new ObjectId(event_id);

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

    const event = await eventsCollection.findOne({ _id: eventObjectId });
    if (!event) {
      const err = new Error(`Event not found with _id: ${event_id}`);
      err.status = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    const existingReview = user.event_scores?.find(
      (entry) => {
        const entryId = entry.event_id instanceof ObjectId ? entry.event_id.toHexString() : entry.event_id.toString();
        return entryId === event_id;
      }
    );
    
    const eventIdStr = event_id; 

    if (existingReview) {
      await usersCollection.updateOne(
        { _id: user._id, "event_scores.event_id": existingReview.event_id },
        { $set: { "event_scores.$.score": parsedScore } }
      );
      logger.info(
        `Updated review: user ${id}, event ${eventIdStr}, score ${parsedScore}`
      );
      res.status(HTTP_STATUS.OK).json({
        message: `Updated score for event ${eventIdStr} to ${parsedScore}.`,
      });
    } else {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $push: {
            event_scores: { event_id: eventObjectId, score: parsedScore }, 
          },
        }
      );
      logger.info(
        `Inserted review: user ${id}, event ${eventIdStr}, score ${parsedScore}`
      );
      res.status(HTTP_STATUS.CREATED).json({
        message: `Inserted review for event ${eventIdStr} with score ${parsedScore}.`,
      });
    }
  } catch (error) {
    logger.error(`Error inserting/updating review: ${error.message}`);
    next(error);
  }
});


export default router;

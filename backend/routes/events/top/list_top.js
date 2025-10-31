import express from "express";

import { getDatabase } from "../../../database.js";
import logger from "../../../logger.js";


const router = express.Router();


router.get("/:limit", async (req, res, next) => {
  const db = getDatabase();
  const limitParam = parseInt(req.params.limit, 10);
  const page = parseInt(req.query.page, 10) || 1;

  if (isNaN(limitParam) || limitParam <= 0) {
    const error = new Error("Limit must be a positive integer.");
    error.status = 400;
    return next(error);
  }

  const limit = Math.min(limitParam, 100); 
  const skip = (page - 1) * limit;

  try {
    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const eventRatings = await usersCollection
      .aggregate([
        { $unwind: "$event_scores" },
        {
          $group: {
            _id: "$event_scores.event_id",
            avg_score: { $avg: "$event_scores.score" },
            review_count: { $sum: 1 },
          },
        },
        { $sort: { avg_score: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    if (!eventRatings.length) {
      return res.status(200).json({
        page,
        limit,
        count: 0,
        results: [],
      });
    }

    const eventIds = eventRatings.map((r) => r._id);

    const events = await eventsCollection.find({ id: { $in: eventIds } }).toArray();

    const results = eventRatings.map((rating) => {
      const event = events.find((e) => e.id === rating._id);
      if (!event) return null;

      return {
        ...event,
        avg_score: parseFloat(rating.avg_score.toFixed(2)),
        review_count: rating.review_count,
      };
    }).filter(Boolean);

    res.status(200).json({
      page,
      limit,
      count: results.length,
      results,
    });
  } catch (error) {
    logger.error(`Error fetching top events: ${error.message}`);
    next(error);
  }
});


export default router;
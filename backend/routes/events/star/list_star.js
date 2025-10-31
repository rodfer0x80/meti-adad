import express from "express";

import { getDatabase } from "../../../database.js";
import logger from "../../../logger.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const db = getDatabase();
  let { page = 1, limit = 10 } = req.query;

  try {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const ratings = await usersCollection
      .aggregate([
        { $unwind: "$event_scores" },
        {
          $group: {
            _id: "$event_scores.event_id",
            avg_rating: { $avg: "$event_scores.score" },
            review_count: { $sum: 1 },
          },
        },
        {
          $match: { avg_rating: 5 },
        },
      ])
      .toArray();

    if (!ratings.length) {
      return res.status(200).json({
        page,
        limit,
        totalPages: 0,
        totalEvents: 0,
        data: [],
      });
    }

    const eventIds = ratings.map((r) => r._id);

    const events = await eventsCollection.find({ id: { $in: eventIds } }).toArray();

    const merged = events.map((event) => {
      const rating = ratings.find((r) => r._id === event.id);
      return {
        ...event,
        avg_rating: rating?.avg_rating || 0,
        review_count: rating?.review_count || 0,
      };
    });

    const totalEvents = merged.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const paginated = merged.slice(skip, skip + limit);

    res.status(200).json({
      page,
      limit,
      totalPages,
      totalEvents,
      data: paginated,
    });
  } catch (error) {
    logger.error(`Error fetching 5-star events: ${error.message}`);
    next(error);
  }
});

export default router;


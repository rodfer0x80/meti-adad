import express from "express";

import { getDatabase } from "../../database.js";
import logger from "../../logger.js";


const router = express.Router();


router.get("/:year(\\d{4})", async (req, res, next) => {
  const db = getDatabase();
  const year = parseInt(req.params.year, 10);
  const page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 10;

  if (isNaN(year) || year < 1900 || year > 3000) {
    const error = new Error(`Invalid year format: ${req.params.year}`);
    error.status = 400;
    return next(error);
  }

  if (limit > 100) limit = 100;
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
      ])
      .toArray();

    if (!eventRatings.length) {
      return res.status(200).json({
        year,
        page,
        limit,
        count: 0,
        results: [],
      });
    }

    const ratedEventIds = eventRatings.map((r) => r._id);

    const events = await eventsCollection
      .find({
        id: { $in: ratedEventIds },
        data_inicio: { $regex: `^${year}`, $options: "i" },
      })
      .skip(skip)
      .limit(limit)
      .toArray();

    const results = events.map((event) => {
      const rating = eventRatings.find((r) => r._id === event.id);
      return {
        ...event,
        avg_score: rating ? parseFloat(rating.avg_score.toFixed(2)) : null,
        review_count: rating ? rating.review_count : 0,
      };
    });

    res.status(200).json({
      year,
      page,
      limit,
      count: results.length,
      results,
    });
  } catch (error) {
    logger.error(`Error fetching rated events for year ${year}: ${error.message}`);
    next(error);
  }
});


export default router;
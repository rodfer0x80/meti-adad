import express from "express";

import { getDatabase } from "../../../database.js";
import logger from "../../../logger.js";


const router = express.Router();


router.get("/:order", async (req, res, next) => {
  const db = getDatabase();
  const { order } = req.params;
  let { page = 1, limit = 10 } = req.query;

  try {
    const sortOrder =
      order && order.toLowerCase() === "asc"
        ? 1
        : order && order.toLowerCase() === "desc"
        ? -1
        : null;

    if (!sortOrder) {
      const error = new Error(`Invalid order parameter: ${order}. Use 'asc' or 'desc'.`);
      error.status = 400;
      return next(error);
    }

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const eventRatings = await usersCollection
      .aggregate([
        { $unwind: "$event_scores" },
        {
          $group: {
            _id: "$event_scores.event_id",
            avg_rating: { $avg: "$event_scores.score" },
            review_count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const eventIds = eventRatings.map((r) => r._id);
    const events = await eventsCollection.find({ id: { $in: eventIds } }).toArray();

    const enrichedEvents = events.map((event) => {
      const ratingInfo = eventRatings.find((r) => r._id === event.id);
      return {
        ...event,
        avg_rating: ratingInfo ? ratingInfo.avg_rating : 0,
        review_count: ratingInfo ? ratingInfo.review_count : 0,
      };
    });

    enrichedEvents.sort((a, b) =>
      sortOrder === 1 ? a.avg_rating - b.avg_rating : b.avg_rating - a.avg_rating
    );

    const totalEvents = enrichedEvents.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const paginated = enrichedEvents.slice(skip, skip + limit);

    res.status(200).json({
      page,
      limit,
      totalPages,
      totalEvents,
      data: paginated,
    });
  } catch (error) {
    logger.error(`Error fetching events ordered by ratings (${order}): ${error.message}`);
    next(error);
  }
});


export default router;
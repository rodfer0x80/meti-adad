import express from "express";
import { ObjectId } from 'mongodb';
import logger from "../../../logger.js";
import HTTP_STATUS from '../../../http_status.js';
import { getDatabase } from "../../../database.js";

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
      error.status = HTTP_STATUS.BAD_REQUEST;
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

    // 1. Aggregate Ratings from Users Collection
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

    // 2. Fetch All Events (To ensure we list events even if they have 0 ratings)
    // If you ONLY want rated events, use: { _id: { $in: eventRatings.map(r => new ObjectId(r._id)) } }
    // But usually, a list should show unrated events too (with 0 score)
    const allEvents = await eventsCollection.find({}).toArray();

    // 3. Enrich Events with Rating Data
    const enrichedEvents = allEvents.map((event) => {
      // Robust compare: ensure both are strings
      const ratingInfo = eventRatings.find((r) => String(r._id) === String(event._id));
      
      return {
        ...event,
        avg_rating: ratingInfo ? ratingInfo.avg_rating : 0,
        review_count: ratingInfo ? ratingInfo.review_count : 0,
      };
    });

    // 4. Sort in Memory
    enrichedEvents.sort((a, b) => {
        if (a.avg_rating === b.avg_rating) {
            // Secondary sort by review count if ratings are equal
            return sortOrder === 1 
                ? a.review_count - b.review_count 
                : b.review_count - a.review_count;
        }
        return sortOrder === 1 
            ? a.avg_rating - b.avg_rating 
            : b.avg_rating - a.avg_rating;
    });

    const totalEvents = enrichedEvents.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const paginated = enrichedEvents.slice(skip, skip + limit);

    res.status(HTTP_STATUS.OK).json({
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

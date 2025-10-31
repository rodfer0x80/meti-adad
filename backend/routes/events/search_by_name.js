import express from "express";
import { getDatabase } from "../../database.js";
import logger from "../../logger.js";

const router = express.Router();

/**
 * GET /events/name
 * Query params:
 *  ?k -> keyword to match in 'nome_atividade' (case-insensitive)
 *  ?page -> optional pagination page (default 1)
 *  ?limit -> optional limit per page (default 10)
 */
router.get("/name", async (req, res, next) => {
  const db = getDatabase();
  const { k, page = 1, limit = 10 } = req.query;

  try {
    if (!k || typeof k !== "string" || k.trim().length === 0) {
      const err = new Error("Missing or invalid query parameter 'k'.");
      err.status = 400;
      throw err;
    }

    const keyword = k.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const eventsCollection = db.collection("events");

    const query = {
      nome_atividade: { $regex: keyword, $options: "i" }, // case-insensitive match
    };

    const events = await eventsCollection
      .find(query)
      .sort({ nome_atividade: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await eventsCollection.countDocuments(query);

    logger.info(
      `Found ${events.length} events matching name "${keyword}" (total: ${total})`
    );

    res.status(200).json({
      search: {
        keyword,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      total,
      events,
    });
  } catch (error) {
    logger.error(`Error searching events by name: ${error.message}`);
    next(error);
  }
});

export default router;


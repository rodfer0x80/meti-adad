import express from "express";
import { getDatabase } from "../../database.js";
import logger from "../../logger.js";

const router = express.Router();

router.get("/free", async (req, res, next) => {
  const db = getDatabase();

  try {
    const eventsCollection = db.collection("events");

    const query = {
      $or: [
        { custo: { $regex: /gratuito/i } },
        { custo: "" },
        { custo: null },
        { custo: { $exists: false } },
      ],
    };

    const events = await eventsCollection
      .find(query)
      .sort({ data_inicio: 1 })
      .toArray();

    logger.info(`Found ${events.length} free events.`);

    res.status(200).json({
      count: events.length,
      events,
    });
  } catch (error) {
    logger.error(`Error fetching free events: ${error.message}`);
    next(error);
  }
});

export default router;


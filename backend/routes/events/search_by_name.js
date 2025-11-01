import express from "express";

import logger from "../../logger.js";
import HTTP_STATUS from '../../http_status.js';
import { getDatabase } from '../../database.js';


const router = express.Router();


router.get("/name", async (req, res, next) => {
  const db = getDatabase();
  const { k, page = 1, limit = 10 } = req.query;

  try {
    if (!k || typeof k !== "string" || k.trim().length === 0) {
      const err = new Error("Missing or invalid query parameter 'k'.");
      err.status = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }

    const keyword = k.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const eventsCollection = db.collection("events");

    const query = {
      nome_atividade: { $regex: keyword, $options: "i" }, // case isensitive match
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

    res.status(HTTP_STATUS.OK).json({
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
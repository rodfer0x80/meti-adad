import express from "express";
import { getDatabase } from "../../../database.js";
import logger from "../../../logger.js";

const router = express.Router();

/**
 * GET /events/date
 * Query Params:
 *  ?start_day, ?start_month, ?start_year
 *  ?end_day, ?end_month, ?end_year
 *  ?page, ?limit
 */
router.get("/", async (req, res, next) => {
  const db = getDatabase();
  const {
    start_day,
    start_month,
    start_year,
    end_day,
    end_month,
    end_year,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    // Construct start and end date strings only if all components exist
    const startDateStr =
      start_day && start_month && start_year
        ? `${start_year}-${start_month.padStart(2, "0")}-${start_day.padStart(2, "0")}T00:00:00Z`
        : null;

    const endDateStr =
      end_day && end_month && end_year
        ? `${end_year}-${end_month.padStart(2, "0")}-${end_day.padStart(2, "0")}T23:59:59Z`
        : null;

    // Create Date objects only if we have full valid strings
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    // Validate constructed dates
    if ((startDate && isNaN(startDate)) || (endDate && isNaN(endDate))) {
      const err = new Error("Invalid date parameters provided.");
      err.status = 400;
      throw err;
    }

    if (startDate && endDate && startDate > endDate) {
      const err = new Error("Start date cannot be after end date.");
      err.status = 400;
      throw err;
    }

    const eventsCollection = db.collection("events");
    const query = {};

    // Build query based on available filters
    if (startDate && endDate) {
      query.$and = [
        { data_inicio: { $gte: startDate.toISOString().split("T")[0] } },
        { data_fim: { $lte: endDate.toISOString().split("T")[0] } },
      ];
    } else if (startDate) {
      query.data_inicio = { $gte: startDate.toISOString().split("T")[0] };
    } else if (endDate) {
      query.data_fim = { $lte: endDate.toISOString().split("T")[0] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await eventsCollection
      .find(query)
      .sort({ data_inicio: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await eventsCollection.countDocuments(query);

    logger.info(
      `Found ${events.length} events between ${startDateStr || "∞"} and ${endDateStr || "∞"}`
    );

    res.status(200).json({
      filters: {
        start_date: startDateStr || null,
        end_date: endDateStr || null,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      total,
      events,
    });
  } catch (error) {
    logger.error(`Error filtering events by date: ${error.message}`);
    next(error);
  }
});

export default router;


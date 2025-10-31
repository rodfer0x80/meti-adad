import { ObjectId } from "mongodb";
import express from 'express';

import { getDatabase } from '../database.js';
import logger from '../logger.js';

const router = express.Router();


router.get("/", async (req, res, next) => {
  const db = getDatabase();

  let page = parseInt(req.query.page) || 1;
  if (page < 1) {
    page = 1;
  }

  let limit = parseInt(req.query.limit) || 10;
  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  try {
    const results = await db.collection('events').find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const jsonResults = results.map(doc => ({
      ...doc,
      _id: doc._id.toString()
    }));

    const totalEvents = await db.collection('events').countDocuments({});
    const totalPages = Math.ceil(totalEvents / limit);
    
    if (page > totalPages && totalPages > 0) {
      page = totalPages + 1;
    }

    res.status(200).json({
      page,
      limit,
      totalPages,
      totalEvents,
      data: jsonResults
    });
  } catch (error) {
    logger.error("Error fetching paginated events collection:", error.message);
    next(error);
  }
});


router.post("/", async (req, res, next) => {
    const db = getDatabase();
    const eventData = req.body;

    if (!eventData || (Array.isArray(eventData) && eventData.length === 0)) {
        const error = new Error("Request body must contain event data (one object or an array of objects).");
        error.status = 400; 
        return next(error);
    }

    try {
        let result;
        
        if (Array.isArray(eventData)) {
            logger.info(`Attempting to insert ${eventData.length} events.`);
            result = await db.collection('events').insertMany(eventData);
            
            if (!result.acknowledged || result.insertedCount !== eventData.length) {
                 const error = new Error(`Failed to insert all events. Only ${result.insertedCount} of ${eventData.length} were inserted.`);
                 error.status = 500;
                 return next(error);
            }
            logger.info(`Successfully added ${result.insertedCount} events: ${Object.values(result.insertedIds).join(', ')}`);
            res.status(201).json({ 
                message: "Events inserted successfully.",
                insertedCount: result.insertedCount,
                insertedIds: result.insertedIds 
            });

        } else if (typeof eventData === 'object') {
            result = await db.collection('events').insertOne(eventData);
            
            if (!result.acknowledged) {
                const error = new Error("Failed to insert the event.");
                error.status = 500;
                return next(error);
            }

            logger.info(`Successfully added one event: ${result.insertedId.toHexString()}`);
            res.status(201).json({ 
                message: "Event inserted successfully.",
                insertedId: result.insertedId 
            });

        } else {
            const error = new Error("Invalid data format. Expected an event object or an array of event objects.");
            error.status = 400; 
            return next(error);
        }

    } catch (error) {
        logger.error("Error during POST /events:", error.message);
        next(error); 
    }
});


export default router;

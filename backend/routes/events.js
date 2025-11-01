import express from 'express';

import logger from '../logger.js';
import HTTP_STATUS from '../http_status.js';
import { getDatabase } from '../database.js';


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

    res.status(HTTP_STATUS.OK).json({
      page,
      limit,
      totalPages,
      totalEvents,
      data: jsonResults
    });
  } catch (error) {
    logger.error("Error fetching events:", error.message);
    next(error);
  }
});


router.post("/", async (req, res, next) => {
    const db = getDatabase();
    const eventData = req.body;

    if (!eventData || (Array.isArray(eventData) && eventData.length === 0)) {
        const error = new Error("Request body empty or invalid.");
        error.status = HTTP_STATUS.BAD_REQUEST; 
        return next(error);
    }

    try {
        let result;
        
        if (Array.isArray(eventData)) {
            result = await db.collection('events').insertMany(eventData);
            
            if (!result.acknowledged || result.insertedCount !== eventData.length) {
                 const error = new Error(`Failed to insert all events. Only ${result.insertedCount} of ${eventData.length} were inserted.`);
                 error.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                 return next(error);
            }
            logger.info(`Added ${result.insertedCount} events: ${Object.values(result.insertedIds).join(', ')}`);
            res.status(HTTP_STATUS.CREATED).json({ 
                message: "Events inserted successfully.",
                insertedCount: result.insertedCount,
                insertedIds: result.insertedIds 
            });

        } else if (typeof eventData === 'object') {
            result = await db.collection('events').insertOne(eventData);
            
            if (!result.acknowledged) {
                const error = new Error("Failed to insert an event.");
                error.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                return next(error);
            }

            logger.info(`Inserted one event: ${result.insertedId.toHexString()}`);
            res.status(HTTP_STATUS.CREATED).json({ 
                message: "Event inserted.",
                insertedId: result.insertedId 
            });

        } else {
            const error = new Error("Invalid data format.");
            error.status = HTTP_STATUS.BAD_REQUEST; 
            return next(error);
        }

    } catch (error) {
        logger.error("Error in request POST /events:", error.message);
        next(error); 
    }
});


export default router;

import { ObjectId } from "mongodb";
import express from 'express';

import { getDatabase } from '../../database.js';

const router = express.Router();

// Get the list of events in $user_geolocation 
// within the range of $radius given as parameter 
router.get("/", async (req, res) => {
  const db = getDatabase();
  const results = await db.collection('events').find({})
    .limit(0)
    .toArray();

  const jsonResults = results.map(doc => ({
    ...doc,
    _id: doc._id.toString()
  }));

  res.status(200).json(jsonResults);
});


export default router;

import { ObjectId } from "mongodb";
import express from 'express';

import { getDatabase } from '../database.js';

const router = express.Router();

// Get first 50 users
router.get("/", async (req, res) => {
  const db = getDatabase();
  const results = await db.collection('users').find({})
    .limit(50)
    .toArray();

  const jsonResults = results.map(doc => ({
    ...doc,
    _id: doc._id.toString()
  }));

  res.status(200).json(jsonResults);
});


export default router;

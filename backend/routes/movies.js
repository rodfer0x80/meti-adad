import { ObjectId } from "mongodb";
import express from 'express';

import { getDatabase } from '../database.js';

const router = express.Router();

// Get first 50 movies
router.get("/", async (req, res) => {
  let db = getDatabase();
  let results = await db.collection('movies').find({})
    .limit(50)
    .toArray();
  res.send(results).status(200);
});

export default router;

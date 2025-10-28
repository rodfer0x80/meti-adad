import { ObjectId } from "mongodb";
import express from 'express';

import { checkDatabaseStatus } from '../database.js';
import { config } from '../config.js';

const { HOST, PORT } = config;

const router = express.Router();


// Sanity check endpoint
router.get('/', async (req, res) => {
  const databaseStatus = await checkDatabaseStatus();

  res.status(200).json({
    status: 'OK',
    service: 'METI ADAD Backend',
    database: databaseStatus.status,
    host: HOST,
    port: PORT,
    uptime: process.uptime() + ' seconds',
  });
});

//const db = getDatabase();
//const collection = db.collection("users");
//const result = await collection.find({}).toArray();


export default router;

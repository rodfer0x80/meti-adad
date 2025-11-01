import express from "express";

import logger from "../logger.js";
import HTTP_STATUS from "../http_status.js";
import { getDatabase } from "../database.js";


const router = express.Router();


const validateUser = (user) => {
  const nome = user.nome;
  if (!nome || typeof nome !== "string") return "Empty or invalid field";
  return null;
};

const standardizeUserData = (userData) => {
  const nome = userData.nome || userData.nome;

  return {
    nome: nome.trim(),
    location: userData.location || userData.localizacao || null,
    registered_at: userData.registered_at || userData.registo || null,
    last_login: userData.last_login || userData.ultimo_login || null,
    latitude: userData.latitude || null,
    longitude: userData.longitude || null,
    event_scores: Array.isArray(userData.event_scores) ? userData.event_scores : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

router.get("/", async (req, res, next) => {
  const db = getDatabase();
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  if (page < 1) page = 1;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;

  try {
    const usersCollection = db.collection("users");

    const results = await usersCollection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const jsonResults = results.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    const totalUsers = await usersCollection.countDocuments({});
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(HTTP_STATUS.OK).json({
      page,
      limit,
      totalPages,
      totalUsers,
      data: jsonResults,
    });
  } catch (error) {
    logger.error("Error fetching users:", error.message);
    error.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const db = getDatabase();
  const data = req.body;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    const error = new Error("Request body empty or invalid");
    error.status = HTTP_STATUS.BAD_REQUEST;
    return next(error);
  }

  try {
    const usersCollection = db.collection("users");

    if (Array.isArray(data)) {
      for (const user of data) {
        const validationError = validateUser(user);
        if (validationError) {
          const error = new Error(validationError);
          error.status = HTTP_STATUS.BAD_REQUEST;
          throw error;
        }
      }

      const standardizedUsers = data.map(standardizeUserData);
      const result = await usersCollection.insertMany(standardizedUsers);

      logger.info(`Successfully added ${result.insertedCount} users.`);
      return res.status(HTTP_STATUS.CREATED).json({
        message: `${result.insertedCount} users created successfully.`,
        insertedIds: Object.values(result.insertedIds),
      });
    }

    const validationError = validateUser(data);
    if (validationError) {
      const error = new Error(validationError);
      error.status = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const standardizedUser = standardizeUserData(data);

    const result = await usersCollection.insertOne(standardizedUser);
    const insertedId = result.insertedId.toString();

    logger.info(`Inserted one user: ${insertedId}`);
    res.status( HTTP_STATUS.CREATED).json({
      message: "User created successfully.",
      insertedId,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status =  HTTP_STATUS.BAD_REQUEST;
      error.message = "Duplicate key error.";
    }
    logger.error(`Error inserting users: ${error.message}`);
    next(error);
  }
});


export default router;
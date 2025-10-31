import { ObjectId } from "mongodb";
import express from "express";
import { getDatabase } from "../database.js";
import logger from "../logger.js";

const router = express.Router();

/* -----------------------------
   Helper: Validate user input
----------------------------- */
const validateUser = (user) => {
  const nome = user.nome;
  if (!nome || typeof nome !== "string") return "Missing or invalid 'nome'/'nome'.";
  return null;
};

/* -----------------------------
   Helper: Standardize user data
----------------------------- */
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

/* -----------------------------
   GET /users — Paginated fetch
----------------------------- */
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

    res.status(200).json({
      page,
      limit,
      totalPages,
      totalUsers,
      data: jsonResults,
    });
  } catch (error) {
    logger.error("Error fetching paginated users:", error.message);
    error.status = 500;
    next(error);
  }
});

/* -----------------------------
   POST /users — Create user(s)
----------------------------- */
router.post("/", async (req, res, next) => {
  const db = getDatabase();
  const data = req.body;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    const error = new Error("Request body must contain user data (single object or array).");
    error.status = 400;
    return next(error);
  }

  try {
    const usersCollection = db.collection("users");

    if (Array.isArray(data)) {
      for (const user of data) {
        const validationError = validateUser(user);
        if (validationError) {
          const error = new Error(validationError);
          error.status = 400;
          throw error;
        }
      }

      const standardizedUsers = data.map(standardizeUserData);
      const result = await usersCollection.insertMany(standardizedUsers);

      logger.info(`Successfully added ${result.insertedCount} users.`);
      return res.status(201).json({
        message: `${result.insertedCount} users created successfully.`,
        insertedIds: Object.values(result.insertedIds),
      });
    }

    const validationError = validateUser(data);
    if (validationError) {
      const error = new Error(validationError);
      error.status = 400;
      throw error;
    }

    const standardizedUser = standardizeUserData(data);

    const result = await usersCollection.insertOne(standardizedUser);
    const insertedId = result.insertedId.toString();

    logger.info(`Successfully added one user: ${insertedId}`);
    res.status(201).json({
      message: "User created successfully.",
      insertedId,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      error.message = "Duplicate key error (user already exists).";
    }
    logger.error(`Error adding users: ${error.message}`);
    next(error);
  }
});

export default router;


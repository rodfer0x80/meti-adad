import express from "express";
import { ObjectId } from "mongodb";

import { getDatabase } from "../../database.js";
import logger from "../../logger.js";


const router = express.Router();


router.put("/:id", async (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;
  const updateData = req.body;

  if (!ObjectId.isValid(id)) {
    const error = new Error(`Invalid event ID format: ${id}`);
    error.status = 400;
    return next(error);
  }

  if (!updateData || typeof updateData !== "object" || Array.isArray(updateData)) {
    const error = new Error("Request body must be a valid JSON object with fields to update.");
    error.status = 400;
    return next(error);
  }

  delete updateData._id;

  try {
    const eventsCollection = db.collection("events");

    const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingEvent) {
      const error = new Error(`Event not found with _id: ${id}`);
      error.status = 404;
      return next(error);
    }

    const allowedFields = [
      "tipologia", "data_inicio", "data_fim", "nome_atividade", "horario",
      "custo", "sinopse", "organizacao", "publico_destinatario",
      "localizacao", "latitude", "longitude"
    ];

    const sanitizedData = {};
    for (const key of allowedFields) {
      if (key in updateData) sanitizedData[key] = updateData[key];
    }

    if (Object.keys(sanitizedData).length === 0) {
      const error = new Error("No valid fields provided for update.");
      error.status = 400;
      return next(error);
    }

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: sanitizedData }
    );

    if (result.modifiedCount === 0) {
      const error = new Error(`Event with _id ${id} was not modified.`);
      error.status = 400;
      return next(error);
    }

    const updatedEvent = await eventsCollection.findOne({ _id: new ObjectId(id) });

    logger.info(`Successfully updated event with _id: ${id}`);
    res.status(200).json({
      message: "Event updated successfully.",
      updatedEvent: {
        ...updatedEvent,
        _id: updatedEvent._id.toString(),
      },
    });
  } catch (error) {
    logger.error(`Error updating event with _id ${id}: ${error.message}`);
    next(error);
  }
});


export default router;
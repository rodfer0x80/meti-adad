import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../../../database.js";
import logger from "../../../logger.js";

const router = express.Router();

// Haversine formula (km)
// https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadian = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadian(lat1)) *
    Math.cos(toRadian(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get("/:id", async (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;
  // radius: km
  const { latitude, longitude, radius = 10, page = 1, limit = 10 } = req.query;

  try {
    if (!ObjectId.isValid(id)) {
      throw Object.assign(new Error(`Invalid user _id: ${id}`), { status: 400 });
    }

    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw Object.assign(new Error(`User not found: ${id}`), { status: 404 });
    }

    const userLatitude = latitude ? parseFloat(latitude) : parseFloat(user.latitude);
    const userLongitude = longitude ? parseFloat(longitude) : parseFloat(user.longitude);
    const searchRadiusKm = parseFloat(radius);

    const allEvents = await eventsCollection.find({}).toArray();

    const nearbyEvents = allEvents
      .map((event) => {
        const eLat = parseFloat(event.latitude);
        const eLon = parseFloat(event.longitude);
        if (isNaN(eLat) || isNaN(eLon)) return null;

        const distance = haversineDistance(userLatitude, userLongitude, eLat, eLon);
        return { ...event, distance_km: distance };
      })
      .filter(
        (event) => event && event.distance_km <= searchRadiusKm
      )
      .sort((a, b) => a.distance_km - b.distance_km);

    const paginated = nearbyEvents.slice(
      (page - 1) * limit,
      page * limit
    );

    logger.info(
      `Found ${nearbyEvents.length} nearby events within ${radius} km`
    );

    res.status(200).json({
      user: { _id: id, latitude: userLatitude, longitude: userLongitude, radius_km: searchRadiusKm },
      count: nearbyEvents.length,
      page: parseInt(page),
      limit: parseInt(limit),
      events: paginated,
    });
  } catch (error) {
    logger.error(`Error fetching nearby events: ${error.message}`);
    next(error);
  }
});

export default router;


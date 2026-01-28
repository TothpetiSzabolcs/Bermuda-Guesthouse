import express from "express";
import Property from "../models/property.model.js";
import Room from "../models/rooms.model.js";

const router = express.Router();

router.get("/property", async (req, res) => {
  try {
    const prop = await Property.findOne()
      .select("_id name basePricePerPerson ntak description")
      .lean();
    if (!prop) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(prop);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find()
      .select("_id name capacity description")
      .sort({ name: 1 })
      .lean();
    res.json(rooms);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
import express from "express";
import Booking from "../models/booking.model.js";
import { createBooking } from "../controllers/bookings.controller.js";
import { bookingLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/", bookingLimiter, createBooking);

router.get("/:code", async (req, res) => {
  try {
    const code = String(req.params.code || "").toUpperCase();
    if (!/^BM-[A-Z0-9]{6}$/.test(code)) return res.status(400).json({ error: "INVALID_CODE" });

    const doc = await Booking.findOne({ code })
      .populate("items.room", "name capacity")
      .select("code status checkIn checkOut guestsTotal price items")
      .lean();

    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });

    res.json({
      code: doc.code,
      status: doc.status,
      checkIn: doc.checkIn,
      checkOut: doc.checkOut,
      guestsTotal: doc.guestsTotal,
      price: doc.price,
      rooms: (doc.items || []).map(i => ({
        id: i.room?._id, name: i.room?.name, capacity: i.room?.capacity, guests: i.guests
      })),
    });
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

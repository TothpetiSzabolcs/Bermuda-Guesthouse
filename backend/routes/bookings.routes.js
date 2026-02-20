import express from "express";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import BlockedDate from "../models/blockedDate.model.js";
import { createBooking } from "../controllers/bookings.controller.js";
import { bookingLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// ── Create booking ───────────────────────────────────────
router.post("/", bookingLimiter, createBooking);

// ── Booked dates for a room (calendar) ───────────────────
// MUST be before /:code, otherwise Express treats "booked-dates" as a code param!
//
// GET /api/bookings/booked-dates?room=ROOM_ID&months=6
// → { room: "...", dates: ["2026-02-20", "2026-02-21", ...] }
router.get("/booked-dates", async (req, res) => {
  try {
    const { room, months = "6" } = req.query;

    if (!room || !mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ error: "INVALID_ROOM_ID" });
    }

    const roomId = new mongoose.Types.ObjectId(room);

    // Date range: today → N months ahead
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + Math.min(Number(months) || 6, 12));

    // Find all active bookings that overlap [today, maxDate] for this room
    const bookings = await Booking.find({
      "items.room": roomId,
      status: { $in: ["pending", "confirmed", "paid"] },
      checkIn: { $lt: maxDate },
      checkOut: { $gt: today },
    })
      .select("checkIn checkOut")
      .lean();

    // Expand each booking into individual date strings
    const dateSet = new Set();

    for (const b of bookings) {
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);
      ci.setHours(0, 0, 0, 0);
      co.setHours(0, 0, 0, 0);

      // Mark every night from checkIn to checkOut - 1
      // (checkOut day is free for new check-in)
      const d = new Date(ci);
      while (d < co) {
        if (d >= today && d < maxDate) {
          const str =
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0");
          dateSet.add(str);
        }
        d.setDate(d.getDate() + 1);
      }
    }

    // ── Also include admin-blocked dates ─────────────────
    const blockedDocs = await BlockedDate.find({
      room: roomId,
      date: { $gte: today, $lt: maxDate },
    }).select("date").lean();

    for (const bd of blockedDocs) {
      const d = new Date(bd.date);
      d.setHours(0, 0, 0, 0);
      const str =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      dateSet.add(str);
    }

    res.json({ room, dates: [...dateSet].sort() });
  } catch (e) {
    console.error("booked-dates error:", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ── Get booking by code ──────────────────────────────────
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

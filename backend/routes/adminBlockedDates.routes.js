import express from "express";
import mongoose from "mongoose";
import BlockedDate from "../models/blockedDate.model.js";
import Room from "../models/rooms.model.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Minden route admin auth mögött
router.use(requireAdmin);

// ── GET /api/admin/blocked-dates?room=ROOM_ID ────────────
// Lekérdezi az adott szoba blokkolt napjait (mai naptól előre)
router.get("/", async (req, res) => {
  try {
    const { room } = req.query;

    const filter = {};
    if (room && mongoose.Types.ObjectId.isValid(room)) {
      filter.room = new mongoose.Types.ObjectId(room);
    }

    // Csak a mai naptól előre
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filter.date = { $gte: today };

    const docs = await BlockedDate.find(filter)
      .populate("room", "name")
      .sort({ date: 1 })
      .lean();

    res.json(docs);
  } catch (e) {
    console.error("blocked-dates GET error:", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ── POST /api/admin/blocked-dates ────────────────────────
// Body: { room: "ROOM_ID", startDate: "2026-03-01", endDate: "2026-03-05", note: "Mózes barátai" }
// Blokkol minden napot a tartományban (startDate-tól endDate-ig, INCLUSIVE)
router.post("/", async (req, res) => {
  try {
    const { room, startDate, endDate, note = "" } = req.body;

    if (!room || !mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ error: "INVALID_ROOM_ID" });
    }

    // Ellenőrizzük hogy létezik-e a szoba
    const roomExists = await Room.exists({ _id: room });
    if (!roomExists) return res.status(404).json({ error: "ROOM_NOT_FOUND" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
      return res.status(400).json({ error: "INVALID_DATE_RANGE" });
    }

    // Max 365 nap egyszerre
    const diffDays = Math.round((end - start) / 86400000) + 1;
    if (diffDays > 365) {
      return res.status(400).json({ error: "RANGE_TOO_LARGE" });
    }

    // Napok generálása
    const ops = [];
    const d = new Date(start);
    while (d <= end) {
      ops.push({
        updateOne: {
          filter: { room: new mongoose.Types.ObjectId(room), date: new Date(d) },
          update: { $set: { note: note.trim() } },
          upsert: true,
        },
      });
      d.setDate(d.getDate() + 1);
    }

    const result = await BlockedDate.bulkWrite(ops, { ordered: false });

    res.json({
      blocked: diffDays,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (e) {
    console.error("blocked-dates POST error:", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ── DELETE /api/admin/blocked-dates ──────────────────────
// Body: { room: "ROOM_ID", startDate: "2026-03-01", endDate: "2026-03-05" }
// Feloldja a blokkolást a tartományban
router.delete("/", async (req, res) => {
  try {
    const { room, startDate, endDate } = req.body;

    if (!room || !mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ error: "INVALID_ROOM_ID" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
      return res.status(400).json({ error: "INVALID_DATE_RANGE" });
    }

    // endDate + 1 nap (hogy inclusive legyen)
    const endPlusOne = new Date(end);
    endPlusOne.setDate(endPlusOne.getDate() + 1);

    const result = await BlockedDate.deleteMany({
      room: new mongoose.Types.ObjectId(room),
      date: { $gte: start, $lt: endPlusOne },
    });

    res.json({ deleted: result.deletedCount });
  } catch (e) {
    console.error("blocked-dates DELETE error:", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

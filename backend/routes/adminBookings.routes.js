import express from "express";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { adminActionLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
router.use(requireAdmin);

router.get("/", async (req, res) => {
  try {
    const n = Math.min(Number(req.query.limit) || 100, 500);
    const list = await Booking.find().sort({ createdAt: -1 }).limit(n).lean();
    res.json(list);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "INVALID_ID" });
    const doc = await Booking.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(doc);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/pay", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });
    if (current.status === "cancelled") return res.status(409).json({ error: "CANNOT_PAY_CANCELLED" });

    const provider = req.body?.provider || "cash";
    const doc = await Booking.findByIdAndUpdate(
      id,
      { $set: { status: "paid", "payment.provider": provider, "payment.paidAt": new Date() }, $unset: { expiresAt: 1 } },
      { new: true }
    ).lean();

    res.json(doc);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/cancel", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });
    if (current.status === "paid") return res.status(409).json({ error: "CANNOT_CANCEL_PAID" });

    const doc = await Booking.findByIdAndUpdate(
      id,
      { $set: { status: "cancelled" }, $unset: { expiresAt: 1 } },
      { new: true }
    ).lean();

    res.json(doc);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
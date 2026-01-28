import express from "express";
import Room from "../models/rooms.model.js";
import Booking from "../models/booking.model.js";
import Property from "../models/property.model.js";
import { diffNights } from "../lib/dates.js";

const router = express.Router();

function allocateGuests(total, rooms) {
  const byPriority = [...rooms].sort((a, b) => {
    const prio = (r) => (r.capacity === 2 ? 0 : 1);
    if (prio(a) !== prio(b)) return prio(a) - prio(b);
    return a.capacity - b.capacity;
  });

  let remaining = total;
  const items = [];

  for (const r of byPriority) {
    if (remaining <= 0) break;
    if (r.capacity >= remaining) {
      items.push({ room: r._id, guests: remaining });
      remaining = 0;
    } else {
      const g = Math.min(r.capacity, remaining);
      items.push({ room: r._id, guests: g });
      remaining -= g;
    }
  }

  if (remaining > 0) throw new Error("NOT_ENOUGH_CAPACITY");
  return items;
}

router.get("/", async (req, res) => {
  try {
    const { checkIn, checkOut, guests = "1", property } = req.query;
    if (!checkIn || !checkOut) return res.status(400).json({ error: "MISSING_DATES" });

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const persons = Number(guests);
    const nights = diffNights(ci, co);
    if (!Number.isFinite(nights) || nights <= 0) return res.status(400).json({ error: "INVALID_DATE_RANGE" });

    const prop = property
      ? await Property.findById(property).lean()
      : await Property.findOne({ active: true }).lean();
    if (!prop) return res.status(404).json({ error: "PROPERTY_NOT_FOUND" });

    const base = prop.basePricePerPerson ?? 9000;

    const allRooms = await Room.find({ property: prop._id, active: true })
      .select("_id name capacity")
      .lean();
    if (allRooms.length === 0) return res.status(404).json({ error: "NO_ROOMS" });

    const overlaps = await Booking.find({
      "items.room": { $in: allRooms.map(r => r._id) },
      status: { $in: ["pending","paid"] },
      checkIn:  { $lt: co },
      checkOut: { $gt: ci }
    }).select("items.room").lean();

    const busy = new Set(overlaps.flatMap(b => b.items.map(i => String(i.room))));
    const freeRooms = allRooms.filter(r => !busy.has(String(r._id)));

    const freeCapacity = freeRooms.reduce((s, r) => s + r.capacity, 0);
    if (freeCapacity < persons) {
      return res.status(409).json({ error: "NOT_ENOUGH_CAPACITY", freeRooms, freeCapacity });
    }

    const items = allocateGuests(persons, freeRooms);
    const price = {
      currency: "HUF",
      basePerPersonPerNight: base,
      nights,
      persons,
      total: nights * persons * base
    };

    res.json({
      property: { id: prop._id, basePricePerPerson: base },
      freeRooms,
      suggested: { items, price }
    });
  } catch (e) {
    if (e.message === "NOT_ENOUGH_CAPACITY") return res.status(409).json({ error: e.message });
    res.status(500).json({ error: "INTERNAL_ERROR", detail: e.message });
  }
});

export default router;

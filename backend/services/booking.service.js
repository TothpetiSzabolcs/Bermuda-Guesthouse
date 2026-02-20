import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import BlockedDate from "../models/blockedDate.model.js";
import Room from "../models/rooms.model.js";
import Property from "../models/property.model.js";
import { generateBookingCode } from "../lib/generateCode.js";

const HOLD_MIN = Number(process.env.BOOKING_HOLD_MIN || 30);

async function validateCapacities(items) {
  const ids = items.map((i) => String(i.room).trim());

  if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error("ROOM_NOT_FOUND");
  }
  const rooms = await Room.find({ _id: { $in: ids } })
    .select("_id capacity")
    .lean();
  const cap = new Map(rooms.map((r) => [String(r._id), r.capacity]));
  for (const it of items) {
    const c = cap.get(String(it.room));
    if (!c) throw new Error("ROOM_NOT_FOUND");
    if (it.guests < 1 || it.guests > c) throw new Error("CAPACITY_EXCEEDED");
  }
}

async function ensureNoOverlap(session, items, checkIn, checkOut) {
  const ids = items.map((i) => String(i.room).trim());

  if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Check existing bookings
  const overlap = await Booking.findOne({
    "items.room": { $in: ids },
    status: { $in: ["pending", "paid"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  })
    .session(session)
    .select("_id");
  if (overlap) throw new Error("DATES_NOT_AVAILABLE");

  // Check admin-blocked dates
  const blocked = await BlockedDate.findOne({
    room: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    date: { $gte: checkIn, $lt: checkOut },
  })
    .session(session)
    .select("_id");
  if (blocked) throw new Error("DATES_NOT_AVAILABLE");
}

export async function createBookingAtomic(payload) {
  await validateCapacities(payload.items);

  let prop = null;

  if (mongoose.Types.ObjectId.isValid(String(payload.property))) {
    prop = await Property.findById(payload.property).lean();
  } else {
    const slug = String(payload.property).trim().toLowerCase();
    prop = await Property.findOne({ slug }).lean();
  }

  if (!prop) throw new Error("PROPERTY_NOT_FOUND");

  const base = prop?.basePricePerPerson ?? 9000;

  const session = await mongoose.startSession();
  try {
    let doc = null;
    await session.withTransaction(async () => {
      await ensureNoOverlap(
        session,
        payload.items,
        payload.checkIn,
        payload.checkOut
      );

      for (let i = 0; i < 5; i++) {
        const code = generateBookingCode("BM", 6);
        try {
          const expiresAt = new Date(Date.now() + HOLD_MIN * 60 * 1000);
          [doc] = await Booking.create(
            [
              {
                ...payload,
                code,
                expiresAt,
                price: { basePerPersonPerNight: base },
              },
            ],
            { session }
          );
          break;
        } catch (err) {
          if (err?.code === 11000 && /code/.test(err.message)) continue;
          throw err;
        }
      }
      if (!doc) throw new Error("CODE_GENERATION_FAILED");
    });
    return doc;
  } finally {
    session.endSession();
  }
}

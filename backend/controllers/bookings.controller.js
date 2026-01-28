import Booking from "../models/booking.model.js";
import { createBookingAtomic } from "../services/booking.service.js";
import { sendMail, bookingMailTemplates } from "../lib/mailer.js";

export async function createBooking(req, res) {
  try {
    const { property, checkIn, checkOut, items, customer, payment, channel = "direct" } = req.body || {};
    if (!property || !checkIn || !checkOut || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const ids = items.map(i => String(i.room));
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ error: "DUPLICATE_ROOM_IN_ITEMS" });
    }
    if (items.some(i => !i?.room || !Number.isInteger(i.guests) || i.guests < 1)) {
      return res.status(400).json({ error: "INVALID_ITEMS" });
    }
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (!Number.isFinite(ci.getTime()) || !Number.isFinite(co.getTime())) {
      return res.status(400).json({ error: "INVALID_DATE_FORMAT" });
    }

    const doc = await createBookingAtomic({ property, checkIn: ci, checkOut: co, items, customer, payment, channel });

    res.status(201).json({ id: doc._id, code: doc.code, price: doc.price, status: doc.status });

    setImmediate(async () => {
      try {
        const populated = await Booking.findById(doc._id)
          .populate("items.room", "name")
          .lean();

        const { subjectGuest, subjectAdmin, text, html } = bookingMailTemplates(populated);

        const tasks = [];
        if (customer?.email) {
          tasks.push(
            sendMail({
              to: customer.email,
              subject: subjectGuest,
              text,
              html,
              replyTo: process.env.MAIL_ADMIN
            })
          );
        }
        tasks.push(
          sendMail({
            to: process.env.MAIL_ADMIN,
            subject: subjectAdmin,
            text,
            html
          })
        );

        await Promise.allSettled(tasks);
      } catch (e) {
        console.error("mail send failed:", e.message);
      }
    });

  } catch (e) {
    const map = {
      INVALID_DATE_RANGE: 400,
      INVALID_ITEMS: 400,
      INVALID_DATE_FORMAT: 400,
      DUPLICATE_ROOM_IN_ITEMS: 400,
      CAPACITY_EXCEEDED: 400,
      ROOM_NOT_FOUND: 404,
      DATES_NOT_AVAILABLE: 409,
      CODE_GENERATION_FAILED: 500,
    };
    return res.status(map[e.message] || 500).json({ error: e.message || "INTERNAL_ERROR" });
  }
}

import Booking from "../models/booking.model.js";
import { createBookingAtomic } from "../services/booking.service.js";
import { sendMail, bookingMailTemplates, MAIL_ADMIN } from "../lib/mailer.js";
import mongoose from "mongoose";
import Property from "../models/property.model.js";
import { makeAdminToken, hashAdminToken } from "../lib/adminActionToken.js";

const isValidEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export async function createBooking(req, res) {
  const reqLang = req?.body?.customer?.lang || "hu";

  try {
    const {
      property,
      checkIn,
      checkOut,
      items,
      customer,
      payment,
      channel = "direct",
    } = req.body || {};

    if (
      !property ||
      !checkIn ||
      !checkOut ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    let propertyId = property;

    if (!mongoose.Types.ObjectId.isValid(String(property))) {
      const slug = String(property).trim().toLowerCase();
      const p = await Property.findOne({ slug }).select("_id").lean();

      if (!p) return res.status(404).json({ error: "PROPERTY_NOT_FOUND" });

      propertyId = p._id;
    }

    const ids = items.map((i) => String(i.room || "").trim());
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ error: "DUPLICATE_ROOM_IN_ITEMS" });
    }

    if (
      items.some((i) => !i?.room || !Number.isInteger(i.guests) || i.guests < 1)
    ) {
      return res.status(400).json({ error: "INVALID_ITEMS" });
    }

    const ci = new Date(checkIn);
    const co = new Date(checkOut);

    if (!Number.isFinite(ci.getTime()) || !Number.isFinite(co.getTime())) {
      return res.status(400).json({ error: "INVALID_DATE_FORMAT" });
    }

    const adminToken = makeAdminToken();
    const adminTokenHash = hashAdminToken(adminToken);

    const adminTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 nap

    const doc = await createBookingAtomic({
      property: propertyId,
      checkIn: ci,
      checkOut: co,
      items,
      customer,
      payment,
      channel,
      adminAction: {
        tokenHash: adminTokenHash,
        expiresAt: adminTokenExpiresAt,
        confirmAt: null,
        cancelAt: null,
        paidAt: null,
      },
    });

    res.status(201).json({
      id: doc._id,
      code: doc.code,
      price: doc.price,
      status: doc.status,
    });

    setImmediate(async () => {
      try {
        const populated = await Booking.findById(doc._id)
          .populate("items.room", "name")
          .lean();

        if (!populated) return;

        const tpl = bookingMailTemplates(populated, { adminToken });

        const tasks = [];

        const guestEmail = populated?.customer?.email?.trim();
        if (isValidEmail(guestEmail)) {
          tasks.push(
            sendMail({
              to: guestEmail,
              subject: tpl.guest.subject,
              text: tpl.guest.text,
              html: tpl.guest.html,
              replyTo: MAIL_ADMIN,
              kind: "guest",
            })
          );
        } else if (guestEmail) {
          console.warn("⚠️ Invalid guest email, skipping:", guestEmail);
        }

        const adminEmail = (process.env.MAIL_ADMIN || "").trim();
        if (isValidEmail(adminEmail)) {
          tasks.push(
            sendMail({
              to: adminEmail,
              subject: tpl.admin.subject,
              text: tpl.admin.text,
              html: tpl.admin.html,
              kind: "admin",
            })
          );
        } else {
          console.warn(
            "⚠️ Invalid MAIL_ADMIN, admin email skipped:",
            adminEmail || "(empty)"
          );
        }

        await Promise.allSettled(tasks);
      } catch (e) {
        console.error("mail send failed:", e?.message || e);
      }
    });
  } catch (e) {
    const lang = reqLang;
    const code = e?.message || "INTERNAL_ERROR";

    const ERR_MSG = {
      DATES_NOT_AVAILABLE: {
        hu: "A kiválasztott dátumokra a szoba nem elérhető.",
        en: "The room is not available for the selected dates.",
        de: "Für die ausgewählten Daten ist das Zimmer nicht verfügbar.",
      },
      ROOM_NOT_FOUND: {
        hu: "A kiválasztott szoba nem található.",
        en: "Selected room was not found.",
        de: "Das ausgewählte Zimmer wurde nicht gefunden.",
      },
      CAPACITY_EXCEEDED: {
        hu: "A vendégek száma meghaladja a szoba kapacitását.",
        en: "Number of guests exceeds the room capacity.",
        de: "Die Gästezahl überschreitet die Zimmerkapazität.",
      },
      INVALID_DATE_FORMAT: {
        hu: "Hibás dátum formátum.",
        en: "Invalid date format.",
        de: "Ungültiges Datumsformat.",
      },
      MISSING_FIELDS: {
        hu: "Hiányzó kötelező mezők.",
        en: "Missing required fields.",
        de: "Pflichtfelder fehlen.",
      },
      PROPERTY_NOT_FOUND: {
        hu: "A szállás nem található.",
        en: "Property not found.",
        de: "Unterkunft nicht gefunden.",
      },
    };

    const map = {
      PROPERTY_NOT_FOUND: 404,
      INVALID_DATE_RANGE: 400,
      INVALID_ITEMS: 400,
      INVALID_DATE_FORMAT: 400,
      DUPLICATE_ROOM_IN_ITEMS: 400,
      CAPACITY_EXCEEDED: 400,
      ROOM_NOT_FOUND: 404,
      DATES_NOT_AVAILABLE: 409,
      CODE_GENERATION_FAILED: 500,
    };

    return res.status(map[code] || 500).json({
      error: code,
      message: ERR_MSG[code]?.[lang] || ERR_MSG[code]?.hu || undefined,
    });
  }
}

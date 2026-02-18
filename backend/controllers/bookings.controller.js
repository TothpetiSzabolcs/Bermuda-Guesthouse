import Booking from "../models/booking.model.js";
import { createBookingAtomic } from "../services/booking.service.js";
import { sendMail, bookingMailTemplates, MAIL_ADMIN } from "../lib/mailer.js";
import mongoose from "mongoose";
import Property from "../models/property.model.js";
import { makeAdminToken, hashAdminToken } from "../lib/adminActionToken.js";
import { validateEmailDomain } from "../lib/emailValidator.js";

const isValidEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());

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

    // ── Email validation (format + MX) ───────────────────
    const email = customer?.email?.trim();
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: "INVALID_EMAIL",
        message:
          reqLang === "hu"
            ? "Érvényes email címet adj meg."
            : reqLang === "de"
              ? "Bitte geben Sie eine gültige E-Mail-Adresse ein."
              : "Please enter a valid email address.",
      });
    }

    const domainCheck = await validateEmailDomain(email);
    if (!domainCheck.valid) {
      return res.status(400).json({
        error: "INVALID_EMAIL_DOMAIN",
        message:
          reqLang === "hu"
            ? "Ez az email szolgáltató nem létezik. Kérjük, ellenőrizd az email címet."
            : reqLang === "de"
              ? "Dieser E-Mail-Anbieter existiert nicht. Bitte überprüfen Sie Ihre E-Mail-Adresse."
              : "This email provider does not exist. Please check your email address.",
      });
    }

    // ── Property lookup ──────────────────────────────────
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
            }),
          );
        }

        if (MAIL_ADMIN) {
          tasks.push(
            sendMail({
              to: MAIL_ADMIN,
              subject: tpl.admin.subject,
              text: tpl.admin.text,
              html: tpl.admin.html,
              kind: "admin",
            }),
          );
        }

        await Promise.allSettled(tasks);
      } catch (e) {
        console.error("booking mail send failed:", e?.message || e);
      }
    });
  } catch (e) {
    console.error("createBooking error:", e?.message || e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

import express from "express";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { adminActionLimiter } from "../middleware/rateLimit.js";
import { hashAdminToken } from "../lib/adminActionToken.js";
import { sendMail, bookingMailTemplates } from "../lib/mailer.js";

const router = express.Router();

const isValidEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

router.get("/action", adminActionLimiter, async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  try {
    const code = String(req.query.code || "")
      .trim()
      .toUpperCase();
    const action = String(req.query.action || "")
      .trim()
      .toLowerCase();
    const token = String(req.query.token || "").trim();

    if (!/^BM-[A-Z0-9]{6}$/.test(code)) {
      return res.status(400).send(html("Hibás foglalási kód."));
    }
    if (!token) {
      return res.status(400).send(html("Hiányzó token."));
    }
    if (!["confirm", "cancel", "paid"].includes(action)) {
      return res.status(400).send(html("Ismeretlen művelet."));
    }

    const booking = await Booking.findOne({ code })
      .select("code status payment adminAction")
      .lean();

    if (!booking) return res.status(404).send(html("Foglalás nem található."));

    const aa = booking.adminAction || {};
    if (!aa.tokenHash || !aa.expiresAt) {
      return res
        .status(400)
        .send(html("Admin token nincs beállítva ehhez a foglaláshoz."));
    }

    const usedField =
      action === "confirm"
        ? "confirmAt"
        : action === "cancel"
        ? "cancelAt"
        : "paidAt";

    if (aa[usedField]) {
      return res
        .status(409)
        .send(html("Ezt a műveletet ezzel a linkkel már elvégezték."));
    }

    if (new Date(aa.expiresAt).getTime() <= Date.now()) {
      return res.status(410).send(html("A link lejárt."));
    }

    if (hashAdminToken(token) !== aa.tokenHash) {
      return res.status(403).send(html("Érvénytelen token."));
    }

    const isTransfer =
      booking?.payment?.method === "transfer" ||
      booking?.payment?.transferRequested === true;

    // ✅ szabályok
    if (booking.status === "cancelled") {
      return res.status(409).send(html("Törölt foglalás nem módosítható."));
    }

    if (action === "confirm" && booking.status !== "pending") {
      return res
        .status(409)
        .send(html("Csak 'pending' foglalás fogadható el."));
    }

    if (
      action === "cancel" &&
      !["pending", "confirmed"].includes(booking.status)
    ) {
      return res
        .status(409)
        .send(html("Ezt a foglalást már nem lehet törölni."));
    }

    if (action === "paid") {
      if (!isTransfer)
        return res
          .status(400)
          .send(html("Ez csak előreutalásnál használható."));
      if (booking.status !== "confirmed") {
        return res
          .status(409)
          .send(html("Csak 'confirmed' foglalás jelölhető fizetettnek."));
      }
    }

    if (action === "cancel") {
      setImmediate(async () => {
        try {
          const populated = await Booking.findOne({ code })
            .populate("items.room", "name")
            .lean();
          if (!populated) return;

          const guestEmail = populated?.customer?.email?.trim();
          if (!isValidEmail(guestEmail)) {
            console.warn(
              "⚠️ No valid guest email for cancel mail, skipping:",
              guestEmail
            );
            return;
          }

          const tpl = bookingMailTemplates(populated);
          await sendMail({
            to: guestEmail,
            subject: tpl.guestCancelled.subject,
            text: tpl.guestCancelled.text,
            html: tpl.guestCancelled.html,
            replyTo: process.env.MAIL_ADMIN,
            kind: "guest",
          });
        } catch (e) {
          console.error("cancel mail send failed:", e?.message || e);
        }
      });
    }

    const now = new Date();
    const $set = {};

    if (action === "confirm") {
      $set.status = "confirmed";
      $set["adminAction.confirmAt"] = now;
    }
    if (action === "cancel") {
      $set.status = "cancelled";
      $set["adminAction.cancelAt"] = now;
    }
    if (action === "paid") {
      $set.status = "paid";
      $set["payment.paidAt"] = now;
      $set["payment.provider"] = "bank";
      $set["adminAction.paidAt"] = now;
    }

    const fieldPath =
      action === "confirm"
        ? "adminAction.confirmAt"
        : action === "cancel"
        ? "adminAction.cancelAt"
        : "adminAction.paidAt";

    const result = await Booking.updateOne(
      { code, [fieldPath]: null },
      { $set }
    );

    if (result.matchedCount === 0) {
      return res.status(409).send(html("A linket közben már felhasználták."));
    }

    const okText =
      action === "confirm"
        ? "Foglalás elfogadva ✅"
        : action === "cancel"
        ? "Foglalás törölve ❌"
        : "Utalás megérkezett – fizetettnek jelölve 💰";

    if (action === "confirm") {
      setImmediate(async () => {
        try {
          const populated = await Booking.findOne({ code })
            .populate("items.room", "name")
            .lean();

          if (!populated) return;

          const guestEmail = populated?.customer?.email?.trim();

          if (!isValidEmail(guestEmail)) {
            console.warn(
              "⚠️ No valid guest email for confirm mail, skipping:",
              guestEmail
            );
            return;
          }

          const tpl = bookingMailTemplates(populated);

          await sendMail({
            to: guestEmail,
            subject: tpl.guestConfirmed.subject,
            text: tpl.guestConfirmed.text,
            html: tpl.guestConfirmed.html,
            replyTo: process.env.MAIL_ADMIN,
            kind: "guest",
          });
        } catch (e) {
          console.error("confirm mail send failed:", e?.message || e);
        }
      });
    }

    if (action === "paid") {
      setImmediate(async () => {
        try {
          const populated = await Booking.findOne({ code })
            .populate("items.room", "name")
            .lean();

          if (!populated) return;

          const guestEmail = populated?.customer?.email?.trim();
          if (!isValidEmail(guestEmail)) {
            console.warn(
              "⚠️ No valid guest email for paid mail, skipping:",
              guestEmail
            );
            return;
          }

          const tpl = bookingMailTemplates(populated);

          await sendMail({
            to: guestEmail,
            subject: tpl.guestPaid.subject,
            text: tpl.guestPaid.text,
            html: tpl.guestPaid.html,
            replyTo: process.env.MAIL_ADMIN,
            kind: "guest",
          });
        } catch (e) {
          console.error("paid mail send failed:", e?.message || e);
        }
      });
    }

    return res.status(200).send(html(okText));
  } catch (e) {
    console.error("admin action error:", e?.message || e);
    return res.status(500).send(html("Belső hiba."));
  }
});

// innen lefelé marad admin védett (dashboardhoz)
router.use(requireAdmin);

router.get("/", async (req, res) => {
  try {
    const n = Math.min(Number(req.query.limit) || 100, 500);
    const list = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(n)
      .populate("items.room", "name")
      .lean();
    res.json(list);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "INVALID_ID" });

    const doc = await Booking.findById(id)
      .populate("items.room", "name slug")
      .lean();

    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(doc);
  } catch {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/confirm", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });

    if (current.status !== "pending")
      return res.status(409).json({ error: "ONLY_PENDING_CAN_BE_CONFIRMED" });

    const doc = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "confirmed",
          "adminAction.confirmAt": new Date(),
        },
      },
      { new: true }
    ).lean();

    // (opcionális) ugyanaz a confirmed email, mint az action linknél
    setImmediate(async () => {
      try {
        const populated = await Booking.findById(id)
          .populate("items.room", "name")
          .lean();

        if (!populated) return;

        const guestEmail = populated?.customer?.email?.trim();
        if (!isValidEmail(guestEmail)) {
          console.warn(
            "⚠️ No valid guest email for confirm mail, skipping:",
            guestEmail
          );
          return;
        }

        const tpl = bookingMailTemplates(populated);
        await sendMail({
          to: guestEmail,
          subject: tpl.guestConfirmed.subject,
          text: tpl.guestConfirmed.text,
          html: tpl.guestConfirmed.html,
          replyTo: process.env.MAIL_ADMIN,
        });
      } catch (e) {
        console.error("confirm mail send failed (dashboard):", e?.message || e);
      }
    });

    res.json(doc);
  } catch (e) {
    console.error("confirm error:", e?.message || e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/**
 * ✅ Admin manuális "paid onsite" (dashboardból)
 * - csak onsite esetén engedjük
 * - csak confirmed esetén
 * - ha már paid -> 409
 */
router.patch("/:id/paid-onsite", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status payment").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });

    if (current.status === "paid")
      return res.status(409).json({ error: "ALREADY_PAID" });

    if (current.status !== "confirmed")
      return res.status(409).json({ error: "ONLY_CONFIRMED_CAN_BE_PAID" });

    if (current?.payment?.method !== "onsite")
      return res.status(400).json({ error: "ONLY_ONSITE_CAN_BE_PAID_ONSITE" });

    const now = new Date();

    const doc = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "paid",
          "payment.provider": "cash",
          "payment.paidAt": now,
          "adminAction.paidAt": now,
        },
      },
      { new: true }
    ).lean();

    res.json(doc);
  } catch (e) {
    console.error("paid-onsite error:", e?.message || e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/pay", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status payment").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });

    const isTransfer =
      current?.payment?.method === "transfer" ||
      current?.payment?.transferRequested === true;

    if (!isTransfer)
      return res.status(400).json({ error: "ONLY_TRANSFER_CAN_BE_PAID" });
    if (current.status !== "confirmed")
      return res.status(409).json({ error: "ONLY_CONFIRMED_CAN_BE_PAID" });

    const now = new Date();

    const doc = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "paid",
          "payment.provider": "bank",
          "payment.paidAt": now,
          "adminAction.paidAt": now,
        },
      },
      { new: true }
    ).lean();

    // ✅ vendég "paid" email (dashboardból is)
    setImmediate(async () => {
      try {
        const populated = await Booking.findById(id)
          .populate("items.room", "name")
          .lean();

        if (!populated) return;

        const guestEmail = populated?.customer?.email?.trim();
        if (!isValidEmail(guestEmail)) {
          console.warn(
            "⚠️ No valid guest email for paid mail, skipping:",
            guestEmail
          );
          return;
        }

        const tpl = bookingMailTemplates(populated);

        await sendMail({
          to: guestEmail,
          subject: tpl.guestPaid.subject,
          text: tpl.guestPaid.text,
          html: tpl.guestPaid.html,
          replyTo: process.env.MAIL_ADMIN,
          kind: "guest",
        });
      } catch (e) {
        console.error("paid mail send failed (dashboard):", e?.message || e);
      }
    });

    res.json(doc);
  } catch (e) {
    console.error("pay error:", e?.message || e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/:id/cancel", adminActionLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "INVALID_ID" });

    const current = await Booking.findById(id).select("status").lean();
    if (!current) return res.status(404).json({ error: "NOT_FOUND" });
    if (current.status === "paid")
      return res.status(409).json({ error: "CANNOT_CANCEL_PAID" });

    const now = new Date();

    const doc = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "cancelled",
          "adminAction.cancelAt": now,
        },
      },
      { new: true }
    ).lean();

    setImmediate(async () => {
      try {
        const populated = await Booking.findById(id)
          .populate("items.room", "name")
          .lean();

        if (!populated) return;

        const guestEmail = populated?.customer?.email?.trim();
        if (!isValidEmail(guestEmail)) {
          console.warn("⚠️ No valid guest email for cancel mail, skipping:", guestEmail);
          return;
        }

        const tpl = bookingMailTemplates(populated);

        await sendMail({
          to: guestEmail,
          subject: tpl.guestCancelled.subject,
          text: tpl.guestCancelled.text,
          html: tpl.guestCancelled.html,
          replyTo: process.env.MAIL_ADMIN,
          kind: "guest",
        });
      } catch (e) {
        console.error("cancel mail send failed (dashboard):", e?.message || e);
      }
    });

    res.json(doc);
  } catch (e) {
    console.error("cancel error:", e?.message || e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});


function html(message) {
  return `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Foglalás kezelése</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:720px;margin:0 auto;}
    .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;}
    .muted{color:#6b7280}
  </style>
</head>
<body>
  <div class="card">
    <h2>${message}</h2>
    <p class="muted">Ezt az oldalt bezárhatod.</p>
  </div>
</body>
</html>`;
}

export default router;

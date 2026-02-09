import Booking from "../models/booking.model.js";
import { sendMail, bookingMailTemplates } from "../lib/mailer.js";
import { makeAdminToken, hashAdminToken } from "../lib/adminActionToken.js";

const isValidEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

async function runOnce({ daysAfterCheckout = 1 } = {}) {
  const cutoff = new Date(Date.now() - daysAfterCheckout * 24 * 60 * 60 * 1000);

  const bookings = await Booking.find({
    status: "paid",
    reviewRequestSentAt: null,
    checkOut: { $lte: cutoff },
  })
    .populate("items.room", "name")
    .lean();

  if (!bookings.length) return;

  for (const b of bookings) {
    const guestEmail = b?.customer?.email?.trim();
    if (!isValidEmail(guestEmail)) {
      console.warn("⚠️ No valid guest email for review request, skipping:", guestEmail);
      continue;
    }

    try {
      // Generate review token
      const reviewToken = makeAdminToken();
      const reviewTokenHash = hashAdminToken(reviewToken);
      const reviewTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Update booking with token
      const updateResult = await Booking.updateOne(
        { _id: b._id, reviewRequestSentAt: null },
        { 
          $set: { 
            reviewRequestSentAt: new Date(),
            reviewToken: reviewTokenHash,
            reviewTokenExpiresAt: reviewTokenExpiresAt
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.warn("⚠️ reviewRequestSentAt already set, skipping:", b?.code);
        continue;
      }

      const tpl = bookingMailTemplates(b, reviewToken);

      await sendMail({
        to: guestEmail,
        subject: tpl.guestReviewRequest.subject,
        text: tpl.guestReviewRequest.text,
        html: tpl.guestReviewRequest.html,
        replyTo: process.env.MAIL_ADMIN,
      });

      console.log(`✅ Review request sent for booking ${b.code}`);
    } catch (e) {
      console.error(
        "review request send failed:",
        b?.code,
        e?.message || e
      );
    }
  }
}


export function startReviewRequestJob({
  intervalMs = 60 * 60 * 1000,
  daysAfterCheckout = 1,
} = {}) {
  setImmediate(() => {
    runOnce({ daysAfterCheckout }).catch((e) =>
      console.error("reviewRequest job initial run failed:", e?.message || e)
    );
  });

  const intervalId = setInterval(() => {
    runOnce({ daysAfterCheckout }).catch((e) =>
      console.error("reviewRequest job interval run failed:", e?.message || e)
    );
  }, intervalMs);

  console.log(
    `✅ reviewRequest job started (every ${Math.round(
      intervalMs / 60000
    )} min, after checkout: ${daysAfterCheckout} day)`
  );

  return intervalId;
}


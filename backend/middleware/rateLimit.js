import rateLimit from "express-rate-limit";

const toMs = (mins, def) => Number(mins ?? def) * 60 * 1000;

export const loginLimiter = rateLimit({
  windowMs: toMs(process.env.RATE_WINDOW_LOGIN_MIN, 15),
  max: Number(process.env.RATE_MAX_LOGIN || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", where: "admin_login" }
});

export const bookingLimiter = rateLimit({
  windowMs: toMs(process.env.RATE_WINDOW_BOOK_MIN, 10),
  max: Number(process.env.RATE_MAX_BOOK || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", where: "create_booking" }
});

export const adminActionLimiter = rateLimit({
  windowMs: toMs(process.env.RATE_WINDOW_ADMIN_ACTION_MIN, 10),
  max: Number(process.env.RATE_MAX_ADMIN_ACTION || 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", where: "admin_action" }
});

export const reviewSubmitLimiter = rateLimit({
  windowMs: toMs(process.env.RATE_WINDOW_REVIEW_SUBMIT_MIN, 15),
  max: Number(process.env.RATE_MAX_REVIEW_SUBMIT || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", where: "review_submit" }
});
import express from "express";
import { listReviewsByProperty, validateReviewToken, submitReview, listApprovedReviews, validateWebReviewToken, submitWebReview } from "../controllers/reviews.controller.js";
import { reviewSubmitLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
router.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Public endpoints
router.get("/", listApprovedReviews);
router.get("/web/validate", validateWebReviewToken);
router.post("/web/submit", reviewSubmitLimiter, submitWebReview);

// Legacy endpoints (for backward compatibility)
router.get("/property", listReviewsByProperty);
router.get("/validate", validateReviewToken);
router.post("/submit", submitReview);

export default router;

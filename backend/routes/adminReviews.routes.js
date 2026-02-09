import express from "express";
import { listReviews, approveReview, rejectReview } from "../controllers/reviews.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get reviews with optional status filter
router.get("/", listReviews);

// Approve a review
router.post("/:id/approve", approveReview);

// Reject a review
router.post("/:id/reject", rejectReview);

export default router;
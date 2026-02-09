import express from "express";
import { listReviewsByProperty, validateReviewToken, submitReview } from "../controllers/reviews.controller.js";

const router = express.Router();

router.get("/", listReviewsByProperty);
router.get("/validate", validateReviewToken);
router.post("/submit", submitReview);

export default router;

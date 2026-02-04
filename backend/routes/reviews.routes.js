import express from "express";
import { listReviewsByProperty } from "../controllers/reviews.controller.js";

const router = express.Router();

router.get("/", listReviewsByProperty);

export default router;

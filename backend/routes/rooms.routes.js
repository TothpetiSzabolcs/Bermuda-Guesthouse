// routes/rooms.routes.js
import express from "express";
import * as rooms from "../controllers/rooms.controller.js";
const router = express.Router();

// /api/rooms?propertySlug=bermuda-vendeghaz&active=true
router.get("/", rooms.listRooms);
// /api/rooms/:slug  (egy szoba részletei)
router.get("/:slug", rooms.getRoomBySlug);

router.put("/:id", rooms.updateRoom);

export default router;

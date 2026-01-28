import express from "express";
import { loginAdmin, logoutAdmin } from "../controllers/adminAuthController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { loginLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);
router.post("/logout", requireAdmin, logoutAdmin);
router.get("/me", requireAdmin, (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  res.json({ username: req.admin.username });
});
router.get("/guard", requireAdmin, (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  res.json({ ok: true });
});

export default router;

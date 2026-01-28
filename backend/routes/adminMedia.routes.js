import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// (opcionális) auth middleware ide: requireAdmin
router.get("/signature", (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || "uploads";
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  const stringToSign = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  res.json({
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    stringToSign, // csak fejlesztésre!
  });
});

export default router;

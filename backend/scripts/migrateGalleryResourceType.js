import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

import GalleryMedia from "../models/gallery.model.js";


async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");

  const r = await GalleryMedia.updateMany(
    { $or: [{ resourceType: { $exists: false } }, { resourceType: null }] },
    { $set: { resourceType: "image" } }
  );

  console.log(`✅ Updated documents: ${r.modifiedCount}`);
  await mongoose.disconnect();
  console.log("👋 Done.");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

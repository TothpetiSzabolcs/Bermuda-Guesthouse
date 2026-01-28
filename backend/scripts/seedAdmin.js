import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminUser from "../models/admin.model.js";

await mongoose.connect(process.env.MONGO_URI);

const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "change-me";
const passwordHash = await bcrypt.hash(password, 12);

await AdminUser.findOneAndUpdate(
  { username },
  { username, passwordHash },
  { upsert: true, new: true }
);

console.log("Admin seeded:", username);
await mongoose.disconnect();



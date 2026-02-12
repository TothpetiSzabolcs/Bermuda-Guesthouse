import "dotenv/config";
import { connectDB } from "./config/db.js";
import Booking from "./models/booking.model.js";

await connectDB();

const code = "BM-TZ5WEY";

const b = await Booking.findOne({ code })
  .select("code reviewToken reviewTokenExpiresAt reviewWebSubmittedAt")
  .lean();

console.log("DB =", Booking.db.name);
console.log(b || "NO_BOOKING");

process.exit(0);

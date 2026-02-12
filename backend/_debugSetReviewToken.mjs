import "dotenv/config";
import { connectDB } from "./config/db.js";
import Booking from "./models/booking.model.js";
import { makeAdminToken, hashAdminToken } from "./lib/adminActionToken.js";

await connectDB();

const code = "BM-TZ5WEY";

const token = makeAdminToken();
const tokenHash = hashAdminToken(token);
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

await Booking.updateOne(
  { code },
  {
    $set: {
      reviewToken: tokenHash,
      reviewTokenExpiresAt: expiresAt,
      reviewWebSubmittedAt: null,
    },
  }
);

console.log("TOKEN =", token);
console.log("HASH  =", tokenHash);
console.log("EXPIRES =", expiresAt.toISOString());
process.exit(0);

import "dotenv/config";
import { connectDB } from "./config/db.js";
import Booking from "./models/booking.model.js";
import { hashAdminToken } from "./lib/adminActionToken.js";

const token = "618e23cc25649b0345fc69c31a09cb9e84c6a676c2e8d7cd5daa47050ca025aa";
const tokenHash = hashAdminToken(token);

await connectDB();
console.log("DB NAME =", Booking.db.name);


const b = await Booking.findOne({
  reviewToken: tokenHash,
  reviewWebSubmittedAt: null,
}).select("code reviewTokenExpiresAt reviewWebSubmittedAt").lean();

if (!b) {
  console.log("NOT_FOUND");
  process.exit(0);
}

const expiresOk = b.reviewTokenExpiresAt && new Date(b.reviewTokenExpiresAt).getTime() > Date.now();
console.log("FOUND", b.code, "expiresOk=", expiresOk, "expiresAt=", b.reviewTokenExpiresAt);
process.exit(0);

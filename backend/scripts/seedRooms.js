import "dotenv/config";
import mongoose from "mongoose";
import Property from "../models/property.model.js";
import Room from "../models/rooms.model.js";

await mongoose.connect(process.env.MONGO_URI);

const prop = await Property.findOne({ slug: "bermuda-vendeghaz" }).lean();
if (!prop) throw new Error("Property nincs meg (slug: bermuda-vendeghaz)");

const rooms = [
  { name: "Családi Szoba (2+1)", slug: "csaladi-szoba", capacity: 3 },
  { name: "Nászutas Szoba (2+1)", slug: "naszutas-szoba", capacity: 3 },
  { name: "Vadász Szoba (2 ágyas)", slug: "vadasz-szoba", capacity: 2 },
];

for (const r of rooms) {
  await Room.findOneAndUpdate(
    { slug: r.slug },
    { ...r, property: prop._id, active: true },
    { upsert: true, new: true }
  );
}

console.log("✅ Rooms ready"); 
await mongoose.disconnect();

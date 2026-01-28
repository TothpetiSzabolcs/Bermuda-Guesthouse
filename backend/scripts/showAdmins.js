import "dotenv/config";
import mongoose from "mongoose";
import AdminUser from "../models/admin.model.js";

await mongoose.connect(process.env.MONGO_URI);
const users = await AdminUser.find().select("username createdAt").lean();
console.log(users);
await mongoose.disconnect();
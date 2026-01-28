import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model("AdminUser", adminUserSchema);

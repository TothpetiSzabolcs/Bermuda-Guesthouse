import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    code: { type: String, required: true, trim: true, uppercase: true },
    
    rating: { type: Number, required: true, min: 1, max: 5 },

    text: { type: String, required: true, trim: true },
    
    name: { type: String, trim: true },

    source: {
      type: String,
      enum: ["legacy", "email", "onsite", "web"],
      default: "legacy",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Legacy fields for backward compatibility
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },

    author: { type: String, default: "" },

    categories: {
      cleanliness: { type: Number, min: 1, max: 10 },
      location: { type: Number, min: 1, max: 10 },
      comfort: { type: Number, min: 1, max: 10 },
      staff: { type: Number, min: 1, max: 10 },
    },

    date: { type: Date, required: true },

    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);

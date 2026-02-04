import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    author: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 10 },

    categories: {
      cleanliness: { type: Number, min: 1, max: 10 },
      location: { type: Number, min: 1, max: 10 },
      comfort: { type: Number, min: 1, max: 10 },
      staff: { type: Number, min: 1, max: 10 },
    },

    text: { type: String, default: "" },
    date: { type: Date, required: true },

    source: {
      type: String,
      enum: ["legacy", "email", "onsite"],
      default: "legacy",
    },

    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);

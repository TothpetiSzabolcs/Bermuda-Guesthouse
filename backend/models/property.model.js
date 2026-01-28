import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },              // "Bermuda Vendégház"
  slug: { type: String, unique: true, index: true },   // "bermuda-vendeghaz"
  ntak: { type: String, required: true },              // "MA24095212"
  rentalMode: { type: String, enum: ["entire","rooms"], default: "rooms" },
  basePricePerPerson: { type: Number, default: 9000 }, // Ft/fő/éj
  amenities: [String],                                 // jakuzzi, dézsa, tó, stb.
  contact: {
    email: String,
    phone: String,
    address: String
  },
  images: [{ url: String, alt: String }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Property", propertySchema);
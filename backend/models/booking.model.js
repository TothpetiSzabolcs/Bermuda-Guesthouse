import mongoose from "mongoose";
import { diffNights } from "../lib/dates.js";

const bookingSchema = new mongoose.Schema({
  code: { type: String, required: true},
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },

  items: {
  type: [{
    room:   { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    guests: { type: Number, required: true, min: 1 }
  }],
  validate: v => Array.isArray(v) && v.length > 0
},

  checkIn:  { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guestsTotal: { type: Number, required: true, min: 1 },

  price: {
    currency: { type: String, default: "HUF" },
    basePerPersonPerNight: { type: Number, default: 9000 },
    nights: Number,
    persons: Number,
    total: Number
  },
  expiresAt: { type: Date, default: null },

  customer: {
    name: String,
    email: String,
    phone: String,
    note: String
  },

  status: { type: String, enum: ["pending","paid","cancelled"], default: "pending", index: true },
  payment: {
    provider: { type: String, enum: ["cash","bank","stripe","barion"], default: "cash" },
    paidAt: Date
  },

  channel: { type: String, default: "direct" }
}, { timestamps: true });

bookingSchema.index({ "items.room": 1, checkIn: 1, checkOut: 1 });
bookingSchema.pre("validate", function(next) {
  const persons = (this.items || []).reduce((s, it) => s + (it.guests || 0), 0);
  this.guestsTotal = persons;

  const nights = diffNights(this.checkIn, this.checkOut);
  if (!Number.isFinite(nights) || nights <= 0) {
    return next(new Error("INVALID_DATE_RANGE"));
  }

  const base = this.price?.basePerPersonPerNight ?? 9000;
  this.price = {
    currency: "HUF",
    basePerPersonPerNight: base,
    nights,
    persons,
    total: nights * persons * base
  };

  next();
});

bookingSchema.index({ code: 1 }, { unique: true, name: "code_unique" });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

export default mongoose.model("Booking", bookingSchema);

import mongoose from "mongoose";

const blockedDateSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  date: { type: Date, required: true, index: true },   // nap eleje UTC-re normalizálva
  note: { type: String, default: "" },                  // pl. "Mózes barátai"
}, { timestamps: true });

// Egyedi: egy szoba egy nap csak egyszer blokkolható
blockedDateSchema.index({ room: 1, date: 1 }, { unique: true });

export default mongoose.model("BlockedDate", blockedDateSchema);

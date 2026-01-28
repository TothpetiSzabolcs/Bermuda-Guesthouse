import mongoose from "mongoose";

const LocalizedString = {
  hu: { type: String, required: true },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
};

const roomSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
  name: LocalizedString,                 // ← volt: String
  description: LocalizedString,
  slug: { type: String, unique: true, index: true },
  capacity: { type: Number, required: true, min: 1 },
  privateBathroom: { type: Boolean, default: true },
  amenities: [String],                  
  images: [{ 
    url: String, 
    publicId: String,      
    alt: String            
  }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
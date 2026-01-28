// backend/models/gallery.model.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const gallerySchema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    category: { type: String, enum: ["to","udvar","csarda","wellness","programok","egyeb"], required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true, index: true },
    resourceType: { type: String, enum: ["image","video"], default: "image", index: true },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    duration: Number,
    posterUrl: String,
    alt: { hu: String, en: String, de: String },
    tags: [String],
    active: { type: Boolean, default: true },
    isCover: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: "galleryimages",
  }
);

export default mongoose.models.GalleryImage || model("GalleryImage", gallerySchema);

import express from "express";
import Room from "../models/rooms.model.js";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();

// (1) Kép hozzáadása (DB-be mentés, feltöltést a kliens végzi Cloudinaryba)
router.post("/:slug/images", async (req, res) => {
  const { publicId, url, alt = "" } = req.body;
  if (!publicId || !url) return res.status(400).json({ message: "Missing publicId or url" });

  const room = await Room.findOneAndUpdate(
    { slug: req.params.slug },
    { $push: { images: { url, publicId, alt } } },
    { new: true }
  ).lean();

  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json({ ok: true });
});

// (2) Kép törlése (Cloudinary + DB)
router.delete("/:slug/images", async (req, res) => {
  const { slug } = req.params;
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ message: "Missing publicId" });

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn("Cloudinary destroy warn:", e?.message);
  }

  await Room.updateOne({ slug }, { $pull: { images: { publicId } } });
  res.json({ ok: true });
});

// (3) Borítókép beállítása (az adott kép legyen az első az images tömbben)
router.patch("/:slug/images/cover", async (req, res) => {
  const { slug } = req.params;
  const { publicId } = req.body;
  const room = await Room.findOne({ slug }).lean();
  if (!room) return res.status(404).json({ message: "Room not found" });

  const img = room.images.find(i => i.publicId === publicId);
  if (!img) return res.status(404).json({ message: "Image not found" });

  const rest = room.images.filter(i => i.publicId !== publicId);
  await Room.updateOne({ slug }, { $set: { images: [img, ...rest] } });
  res.json({ ok: true });
});

router.patch("/:slug/description", async (req, res) => {
  const { slug } = req.params;
  const { hu = "", en = "", de = "" } = req.body;
  const r = await Room.findOneAndUpdate(
    { slug },
    { $set: { "description.hu": hu, "description.en": en, "description.de": de } },
    { new: true }
  ).lean();
  if (!r) return res.status(404).json({ message: "Room not found" });
  res.json({ ok: true });
});

export default router;

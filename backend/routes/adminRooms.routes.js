import express from "express";
import multer from "multer";
import Room from "../models/rooms.model.js";
import cloudinary from "../config/cloudinary.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB for room images
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Csak képfájlok engedélyezettek"));
  },
});

// Middleware: minden route admin-only
router.use(requireAdmin);

// (0) Szoba képeinek lekérése (publicId-vel együtt, admin-only)
router.get("/:slug/images", async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug })
    .select("name slug images")
    .lean();
  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json({
    name: room.name,
    slug: room.slug,
    images: room.images ?? [],
  });
});

// (1) Kép feltöltése (file → Cloudinary → DB)
router.post("/:slug/images/upload", upload.single("file"), async (req, res) => {
  try {
    const { slug } = req.params;
    const { alt = "" } = req.body;

    if (!req.file) return res.status(400).json({ message: "Fájl hiányzik" });

    const room = await Room.findOne({ slug }).lean();
    if (!room) return res.status(404).json({ message: "Szoba nem található" });

    const folder = `bermuda/rooms/${slug}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: "image" },
          (err, r) => (err ? reject(err) : resolve(r)),
        )
        .end(req.file.buffer);
    });

    await Room.updateOne(
      { slug },
      {
        $push: {
          images: {
            url: result.secure_url,
            publicId: result.public_id,
            alt,
          },
        },
      },
    );

    res.status(201).json({
      ok: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        alt,
      },
    });
  } catch (e) {
    console.error("Room image upload error:", e?.message || e);
    res.status(500).json({ message: "Feltöltési hiba" });
  }
});

// (2) Kép hozzáadása (ha már van Cloudinary URL — legacy)
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

// (3) Kép törlése (Cloudinary + DB)
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

// (4) Borítókép beállítása
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

// (5) Leírás szerkesztése
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
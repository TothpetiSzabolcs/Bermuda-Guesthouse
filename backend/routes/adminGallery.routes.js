// routes/adminGallery.routes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.js";
import Property from "../models/property.model.js";
import GalleryMedia from "../models/gallery.model.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      return cb(null, true);
    }
    cb(new Error("Unsupported file type"));
  },
});

// LISTA (admin)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const {
      propertySlug,
      category = "all",
      page = 1,
      limit = 24,
      resourceType = "all",
    } = req.query;

    const query = {};
    if (propertySlug) {
      const prop = await Property.findOne({ slug: propertySlug })
        .select("_id")
        .lean();
      if (!prop)
        return res.json({ items: [], total: 0, page: 1, limit: Number(limit) });
      query.property = prop._id;
    }
    if (category !== "all") query.category = category;
    if (resourceType === "image") query.resourceType = "image";
    if (resourceType === "video") query.resourceType = "video";

    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      GalleryMedia.find(query)
        .select(
          "url publicId resourceType posterUrl width height format alt category isCover createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      GalleryMedia.countDocuments(query),
    ]);

    res.json({ items, total, page: p, limit: l });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "List error" });
  }
});

// TÖRLÉS (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const item = await GalleryMedia.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Not found" });

    try {
      await cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.resourceType || "image",
      });
    } catch (e) {
      console.warn("Cloudinary destroy warn:", e?.message);
    }

    await GalleryMedia.deleteOne({ _id: item._id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Delete error" });
  }
});

// COVER BEÁLLÍTÁS (admin) – 1 borító / property + kategória
router.post("/:id/cover", requireAdmin, async (req, res) => {
  try {
    const media = await GalleryMedia.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    await GalleryMedia.updateMany(
      { property: media.property, category: media.category, isCover: true },
      { $set: { isCover: false } },
    );
    media.isCover = true;
    await media.save();

    res.json({ ok: true, item: media });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Set cover error" });
  }
});

async function handlerUpload(req, res) {
  try {
    const {
      propertySlug,
      category = "egyeb",
      altHu = "",
      altEn = "",
      altDe = "",
    } = req.body;
    if (!req.file) return res.status(400).json({ message: "file missing" });
    if (!propertySlug)
      return res.status(400).json({ message: "propertySlug missing" });

    const prop = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();
    if (!prop) return res.status(404).json({ message: "Property not found" });

    const folder = `bermuda/gallery/${category}`;
    const isVideo = req.file.mimetype?.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // debug infó (dev-ben lásd a konzolon)
    console.log("[upload]", {
      name: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      resourceType,
      folder,
    });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (err, r) => (err ? reject(err) : resolve(r)),
        )
        .end(req.file.buffer);
    });

    let posterUrl;
    if (result.resource_type === "video") {
      try {
        const exp = await cloudinary.uploader.explicit(result.public_id, {
          resource_type: "video",
          type: "upload",
          eager: [{ format: "jpg", transformation: [{ so: 1 }] }],
          eager_async: false,
        });
        posterUrl = exp?.eager?.[0]?.secure_url;
      } catch (e) {
        console.warn("poster gen warn:", e?.message || e);
      }
    }

    const doc = await GalleryMedia.create({
      property: prop._id,
      category,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type, // "image" | "video"
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      duration: result.duration,
      posterUrl,
      alt: { hu: altHu, en: altEn, de: altDe },
      active: true,
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error("Upload error:", e?.http_code, e?.message || e);
    if (e?.error) console.error("Cloudinary error:", e.error);
    res.status(500).json({
      message: "Upload error",
      detail: e?.message || null,
      cloudinary: e?.error || null,
    });
  }
}

router.post("/upload", requireAdmin, upload.single("file"), handlerUpload);
router.post("/", requireAdmin, upload.single("file"), handlerUpload); // <<< most már a gyökér is működik

export default router;

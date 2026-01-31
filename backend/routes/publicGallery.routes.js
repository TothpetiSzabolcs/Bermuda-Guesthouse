// routes/publicGallery.routes.js
import { Router } from "express";
import Property from "../models/property.model.js";
import GalleryImage from "../models/gallery.model.js";

const router = Router();

// Segéd: poszter vagy első frame videóhoz
const getCoverRaw = (doc) => {
  if (!doc) return null;
  if (doc.resourceType === "video") {
    // ha van eltárolt poszter, azt használjuk; különben 1. másodperc JPG
    return doc.posterUrl || doc.url.replace("/upload/", "/upload/so_1,f_jpg/");
  }
  return doc.url;
};

// GET /api/public/gallery
// Paginált lista + szűrés: ?propertySlug=...&category=...&page=1&limit=24&resourceType=image|video|all&tags=a,b,c&sort=new|old
router.get("/", async (req, res) => {
  try {
    const {
      propertySlug,
      category,
      page = 1,
      limit = 24,
      resourceType = "all",
      tags,
      sort = "new",
    } = req.query;

    if (!propertySlug) {
      return res.status(400).json({ message: "propertySlug missing" });
    }

    const prop = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();
    if (!prop) return res.status(404).json({ message: "Property not found" });

    const q = { property: prop._id, active: true };
    if (category && category !== "all") q.category = category;
    if (resourceType === "image") q.resourceType = "image";
    if (resourceType === "video") q.resourceType = "video";
    if (typeof tags === "string" && tags.trim()) {
      q.tags = {
        $in: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const skip = (p - 1) * l;
    const sortObj = sort === "old" ? { createdAt: 1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      GalleryImage.find(q)
        .select(
          "url publicId resourceType posterUrl width height format alt category createdAt",
        )
        .sort(sortObj)
        .skip(skip)
        .limit(l)
        .lean(),
      GalleryImage.countDocuments(q),
    ]);

    res.json({
      total, // összes (szűrt) elem
      count: items.length, // aktuális oldal elemszáma
      page: p,
      limit: l,
      hasNext: p * l < total,
      hasPrev: p > 1,
      items,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/public/gallery/covers?propertySlug=...
// Kategóriánként egy "borító" (kép vagy videó poszter)
router.get("/covers", async (req, res) => {
  try {
    const { propertySlug, categories } = req.query;
    if (!propertySlug) {
      return res.status(400).json({ message: "propertySlug missing" });
    }

    const prop = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();
    if (!prop) return res.json({ covers: {} });

    // ✅ dinamikus kategóriák (ha nincs megadva, marad a régi default)
    const parsedCats =
      typeof categories === "string" && categories.trim()
        ? categories
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

    const CATS = parsedCats ?? [
      "to",
      "udvar",
      "csarda",
      "wellness",
      "programok",
      "egyeb",
    ];

    const entries = await Promise.all(
      CATS.map(async (cat) => {
        const doc =
          (await GalleryImage.findOne({
            property: prop._id,
            category: cat,
            active: true,
            isCover: true, // ✅ adminban beállított cover
          })
            .select("url posterUrl resourceType publicId width height format createdAt")
            .sort({ createdAt: -1 })
            .lean()) ||
          (await GalleryImage.findOne({
            property: prop._id,
            category: cat,
            active: true, // fallback: legfrissebb aktív
          })
            .select("url posterUrl resourceType publicId width height format createdAt")
            .sort({ createdAt: -1 })
            .lean());

        if (!doc) return [cat, null];

        const coverRaw = getCoverRaw(doc);
        return [
          cat,
          {
            coverRaw,
            resourceType: doc.resourceType,
            width: doc.width,
            height: doc.height,
            publicId: doc.publicId,
            createdAt: doc.createdAt,
            isCover: !!doc.isCover, // (opcionális) debughoz hasznos
          },
        ];
      })
    );

    res.json({ covers: Object.fromEntries(entries) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "covers error" });
  }
});

// GET /api/public/gallery/stats?propertySlug=...
// Kategória- és típus-statisztika
router.get("/stats", async (req, res) => {
  try {
    const { propertySlug } = req.query;
    if (!propertySlug) {
      return res.status(400).json({ message: "propertySlug missing" });
    }

    const prop = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();
    if (!prop) return res.json({ total: 0, byCategory: {}, byType: {} });

    const match = { property: prop._id, active: true };

    const [byCategoryRaw, byTypeRaw, total] = await Promise.all([
      GalleryImage.aggregate([
        { $match: match },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      GalleryImage.aggregate([
        { $match: match },
        { $group: { _id: "$resourceType", count: { $sum: 1 } } },
      ]),
      GalleryImage.countDocuments(match),
    ]);

    const byCategory = Object.fromEntries(
      byCategoryRaw.map((x) => [x._id, x.count]),
    );
    const byType = Object.fromEntries(byTypeRaw.map((x) => [x._id, x.count]));

    res.json({ total, byCategory, byType });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "stats error" });
  }
});

// GET /api/public/gallery/random?propertySlug=...&category=...&limit=8
router.get("/random", async (req, res) => {
  try {
    const { propertySlug, category, limit = 8 } = req.query;
    if (!propertySlug) {
      return res.status(400).json({ message: "propertySlug missing" });
    }

    const prop = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();
    if (!prop) return res.json({ items: [] });

    const match = { property: prop._id, active: true };
    if (category && category !== "all") match.category = category;

    const items = await GalleryImage.aggregate([
      { $match: match },
      { $sample: { size: Math.max(1, Number(limit)) } },
      {
        $project: {
          url: 1,
          posterUrl: 1,
          publicId: 1,
          resourceType: 1,
          width: 1,
          height: 1,
          format: 1,
          alt: 1,
          category: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "random error" });
  }
});

// GET /api/public/gallery/:id  — egy elem részletesen
router.get("/:id", async (req, res) => {
  try {
    const doc = await GalleryImage.findOne({
      _id: req.params.id,
      active: true,
    })
      .select(
        "url publicId resourceType posterUrl width height format alt category createdAt",
      )
      .lean();

    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

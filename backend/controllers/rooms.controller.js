import Property from "../models/property.model.js";
import Room from "../models/rooms.model.js";

const SUPPORTED_LANGS = ["hu", "en", "de"];

function pickLang(val, lang) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val[lang]) return val[lang];
    if (val.hu) return val.hu;
    if (val.en) return val.en;
    if (val.de) return val.de;
  }
  return "";
}

export const listRooms = async (req, res) => {
  try {
    const { propertySlug, active = "true" } = req.query;
    const lang = SUPPORTED_LANGS.includes(req.query.lang) ? req.query.lang : "hu";

    const query = {};
    if (active !== "all") query.active = active === "true";

    if (propertySlug) {
      const prop = await Property.findOne({ slug: propertySlug })
        .select("_id")
        .lean();
      if (!prop) return res.status(404).json({ message: "Property not found" });
      query.property = prop._id;
    }

    const rooms = await Room.find(query)
      .select("name slug capacity privateBathroom amenities images active description")
      .sort({ capacity: -1, [`name.${lang}`]: 1 })
      .lean();

    const mapped = rooms.map((r) => {
      const firstImg = r.images?.[0];
      return {
        id: r._id,
        name: pickLang(r.name, lang),
        slug: r.slug,
        guests: r.capacity,
        description: pickLang(r.description, lang),
        amenities: r.amenities ?? [],
        image: firstImg?.url ?? null,
        imageAlt: firstImg ? pickLang(firstImg.alt, lang) : "",
        privateBathroom: r.privateBathroom,
        active: r.active,
      };
    });

    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoomBySlug = async (req, res) => {
  try {
    const lang = SUPPORTED_LANGS.includes(req.query.lang) ? req.query.lang : "hu";

    const room = await Room.findOne({ slug: req.params.slug, active: true })
      .select("name slug capacity privateBathroom amenities images description")
      .lean();

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({
      id: room._id,
      name: pickLang(room.name, lang),
      slug: room.slug,
      guests: room.capacity,
      description: pickLang(room.description, lang),
      amenities: room.amenities ?? [],
      images: (room.images ?? []).map((img) => ({
        url: img.url,
        alt: pickLang(img.alt, lang),
      })),
      privateBathroom: room.privateBathroom,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

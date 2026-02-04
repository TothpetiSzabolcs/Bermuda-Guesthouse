import Review from "../models/review.model.js";
import Property from "../models/property.model.js";

export const listReviewsByProperty = async (req, res) => {
  try {
    const { propertySlug, limit = 6 } = req.query;

    const property = await Property.findOne({ slug: propertySlug })
      .select("_id")
      .lean();

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const reviews = await Review.find({
      property: property._id,
      approved: true,
    })
      .sort({ date: -1 })
      .limit(Number(limit))
      .lean();

    const count = await Review.countDocuments({
      property: property._id,
      approved: true,
    });

    const avg =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        : null;

    res.json({
      count,
      average: avg,
      reviews: reviews.map((r) => ({
        rating: r.rating,
        text: r.text,
        date: r.date,
        categories: r.categories,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

import Review from "../models/review.model.js";
import Property from "../models/property.model.js";
import Booking from "../models/booking.model.js";
import { hashAdminToken } from "../lib/adminActionToken.js";

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
        author: r.author,
        source: r.source,
        categories: r.categories,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateReviewToken = async (req, res) => {
  try {
    const { t: token } = req.query;

    if (!token) {
      return res.json({ valid: false, error: "missing_token" });
    }

    const tokenHash = hashAdminToken(token);
    
    const booking = await Booking.findOne({
      reviewToken: tokenHash,
      reviewSubmittedAt: null,
      reviewTokenExpiresAt: { $gt: new Date() },
    })
      .populate("property", "slug name")
      .lean();

    if (!booking) {
      return res.json({ valid: false, error: "invalid_token" });
    }

    res.json({
      valid: true,
      booking: {
        code: booking.code,
        propertySlug: booking.property.slug,
        propertyName: booking.property.name,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { t: token } = req.query;
    const { rating, text, author } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ message: "Review text must be at least 20 characters" });
    }

    const tokenHash = hashAdminToken(token);
    
    const booking = await Booking.findOne({
      reviewToken: tokenHash,
      reviewSubmittedAt: null,
      reviewTokenExpiresAt: { $gt: new Date() },
    }).lean();

    if (!booking) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Mark token as used
    await Booking.updateOne(
      { _id: booking._id },
      { $set: { reviewSubmittedAt: new Date() } }
    );

    // Create review
    const property = await Property.findById(booking.property);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const review = new Review({
      property: booking.property,
      author: author?.trim() || "",
      rating: rating * 2, // Convert 1-5 to 2-10 scale
      text: text.trim(),
      date: new Date(),
      source: "email",
      approved: false, // Requires moderation
    });

    await review.save();

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

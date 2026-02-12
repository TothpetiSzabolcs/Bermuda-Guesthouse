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


    await Booking.updateOne(
      { _id: booking._id },
      { $set: { reviewSubmittedAt: new Date() } }
    );


    const property = await Property.findById(booking.property);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const review = new Review({
      property: booking.property,
      author: author?.trim() || "",
      rating: rating * 2, 
      text: text.trim(),
      date: new Date(),
      source: "email",
      approved: false, 
    });

    await review.save();

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const listApprovedReviews = async (req, res) => {
  try {
    const { limit = 10, propertySlug } = req.query;

    let propertyId = null;
    if (propertySlug) {
      const prop = await Property.findOne({ slug: propertySlug }).select("_id").lean();
      if (!prop) return res.status(404).json({ message: "Property not found" });
      propertyId = prop._id;
    }

    const filter = {
      $and: [
        propertyId ? { property: propertyId } : {},
        {
          $or: [
            { status: "approved" },   
            { approved: true },       
          ],
        },
      ],
    };

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1, date: -1 })
      .limit(Number(limit))
      .lean();

    const count = await Review.countDocuments(filter);

    const avg =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

    res.json({
      count,
      average: avg,
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        text: r.text,
        name: r.name || r.author || "",
        source: r.source,
        date: r.date || r.createdAt,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};


// New web validation endpoint
export const validateWebReviewToken = async (req, res) => {
  try {
    const { t: token } = req.query;

    if (!token) {
      return res.json({ valid: false, error: "missing_token" });
    }

    const tokenHash = hashAdminToken(token);
    
    const booking = await Booking.findOne({
      reviewToken: tokenHash,
      reviewWebSubmittedAt: null,
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

// New web submit endpoint
export const submitWebReview = async (req, res) => {
  try {
    const { token, rating, text, name } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ message: "Review text must be at least 20 characters" });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({ message: "Review text must not exceed 1000 characters" });
    }

    const tokenHash = hashAdminToken(token);
    
    const booking = await Booking.findOne({
      reviewToken: tokenHash,
      reviewWebSubmittedAt: null,
      reviewTokenExpiresAt: { $gt: new Date() },
    }).lean();

    if (!booking) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Mark token as used
    await Booking.updateOne(
      { _id: booking._id },
      { 
        $set: { 
          reviewWebSubmittedAt: new Date(),
          reviewToken: null, // Clear token
          reviewTokenExpiresAt: null // Clear expiry
        } 
      }
    );

    // Create review with new schema
    const review = new Review({
      bookingId: booking._id,
      code: booking.code,
      rating: rating,
      text: text.trim(),
      name: name?.trim() || "",
      source: "web",
      status: "pending", // Default to pending
      // Legacy fields for backward compatibility
      property: booking.property,
      author: name?.trim() || "",
      date: new Date(),
      approved: false, // Requires moderation
    });

    await review.save();

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin endpoints
export const listReviews = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    
    const filter = status && status !== "all" ? { status } : {};
    
    const reviews = await Review.find(filter)
      .populate("bookingId", "code email")
      .populate("property", "name slug")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Review.countDocuments(filter);

    res.json({
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        text: r.text,
        name: r.name,
        code: r.bookingId?.code || r.code,
        email: r.bookingId?.email, // Note: this will be excluded from UI per requirements
        source: r.source,
        status: r.status,
        createdAt: r.createdAt,
        propertyName: r.property?.name,
        propertySlug: r.property?.slug,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status: "approved",
        approved: true // Update legacy field
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ success: true, message: "Review approved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status: "rejected",
        approved: false // Update legacy field
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ success: true, message: "Review rejected" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

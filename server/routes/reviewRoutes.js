const express = require("express");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE a review (customer only, for their own completed booking)
router.post("/", protect, authorize("customer"), async (req, res) => {
  try {
    const { bookingId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to review this booking" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    const review = new Review({
      bookingId,
      customerId: req.user.id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
    });

    await review.save();
    res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET average rating + count for a specific service
router.get("/service/:serviceId", async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId });

    if (reviews.length === 0) {
      return res.status(200).json({ averageRating: null, count: 0 });
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (total / reviews.length).toFixed(1);

    res.status(200).json({ averageRating: Number(averageRating), count: reviews.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET booking IDs already reviewed by the logged-in customer
router.get("/my-reviewed-bookings", protect, authorize("customer"), async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.id }).select("bookingId");
    const bookingIds = reviews.map((r) => r.bookingId.toString());
    res.status(200).json(bookingIds);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
const express = require("express");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE a booking (customer only)
router.post("/", protect, authorize("customer"), async (req, res) => {
  try {
    const { serviceId, bookingDate, timeSlot } = req.body;

    // Find the service to get the providerId
    const service = await Service.findById(serviceId);
    if (!service || !service.isApproved) {
      return res.status(404).json({ message: "Service not found or not approved" });
    }

    // CONFLICT CHECK: is this provider already booked at this exact date+slot?
    const conflict = await Booking.findOne({
      providerId: service.providerId,
      bookingDate,
      timeSlot,
      status: { $in: ["pending", "accepted"] }, // only active bookings block the slot
    });

    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked for this provider" });
    }

    const newBooking = new Booking({
      customerId: req.user.id,
      providerId: service.providerId,
      serviceId,
      bookingDate,
      timeSlot,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created, waiting for provider confirmation", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET logged-in customer's bookings
router.get("/my-bookings", protect, authorize("customer"), async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("serviceId", "title category price")
      .populate("providerId", "name phone");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET logged-in provider's incoming bookings
router.get("/provider-bookings", protect, authorize("provider"), async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user.id })
      .populate("serviceId", "title category price")
      .populate("customerId", "name phone location");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE booking status (provider accepts/rejects/completes)
router.put("/:id/status", protect, authorize("provider"), async (req, res) => {
  try {
    const { status } = req.body; // "accepted" | "rejected" | "completed"

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure this provider owns this booking
    if (booking.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// CANCEL booking (customer only, before it's completed)
router.put("/:id/cancel", protect, authorize("customer"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
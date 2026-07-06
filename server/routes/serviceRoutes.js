const express = require("express");
const Service = require("../models/Service");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE a service (provider only)
router.post("/", protect, authorize("provider"), async (req, res) => {
  try {
    const { category, title, description, price } = req.body;

    const newService = new Service({
      providerId: req.user.id,
      category,
      title,
      description,
      price,
    });

    await newService.save();
    res.status(201).json({ message: "Service created, pending admin approval", service: newService });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all approved services (public - customers browsing)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isApproved: true }).populate("providerId", "name phone location");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET logged-in provider's own services
router.get("/my-services", protect, authorize("provider"), async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user.id });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all pending services (admin only)
router.get("/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const services = await Service.find({ isApproved: false }).populate("providerId", "name email");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// APPROVE a service (admin only)
router.put("/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service approved", service });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
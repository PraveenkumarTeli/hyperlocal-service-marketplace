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

// UPDATE a service (provider only, must own it) - resets approval, requires admin to re-approve
router.put("/:id", protect, authorize("provider"), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this service" });
    }

    const { category, title, description, price } = req.body;

    service.category = category ?? service.category;
    service.title = title ?? service.title;
    service.description = description ?? service.description;
    service.price = price ?? service.price;
    service.isApproved = false;

    await service.save();

    res.status(200).json({ message: "Service updated, pending re-approval", service });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all approved services (public - customers browsing)
// Supports optional query params: ?search=&category=&location=
router.get("/", async (req, res) => {
  try {
    const { search, category, location } = req.query;

    const query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      query.$or = [{ title: regex }, { category: regex }];
    }

    let services = await Service.find(query).populate("providerId", "name phone location");

    // location lives on the populated provider, so filter in memory
    if (location) {
      const locRegex = new RegExp(location, "i");
      services = services.filter((s) => locRegex.test(s.providerId?.location || ""));
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET distinct categories currently in use (for the filter dropdown)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Service.distinct("category", { isApproved: true });
    res.status(200).json(categories);
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
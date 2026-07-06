const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g. "Electrician", "Plumber", "Tutor"
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false, // admin must approve before it goes live
  },
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
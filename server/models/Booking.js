const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  bookingDate: {
    type: String, // e.g. "2026-07-10"
    required: true,
  },
  timeSlot: {
    type: String, // e.g. "10:00-11:00"
    required: true,
  },
  priceAtBooking: {
  type: Number,
  required: true,
},
serviceTitleAtBooking: {
  type: String,
  required: true,
},
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "refunded"],
    default: "unpaid",
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
const rateLimit = require("express-rate-limit");

// Limits repeated login attempts to slow down brute-force password guessing.
// 5 attempts per 15 minutes, per IP address.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
});

module.exports = { loginLimiter };
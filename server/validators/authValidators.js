const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["customer", "provider"]).withMessage("Role must be either customer or provider"),

  body("phone")
    .optional({ checkFalsy: true })
    .isLength({ min: 10, max: 15 }).withMessage("Please enter a valid phone number"),

  body("location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 }).withMessage("Location must be at least 2 characters"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidation, loginValidation };
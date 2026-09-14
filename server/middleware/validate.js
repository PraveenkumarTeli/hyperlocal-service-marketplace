const { validationResult } = require("express-validator");

// Runs after express-validator checks — collects errors into your existing
// { message, error } response format so the frontend doesn't need to change.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // first error, matches your existing single-message style
      errors: errors.array(), // full list, in case the frontend wants to show all of them later
    });
  }
  next();
};

module.exports = validate;
const { validationResult, body, param, query } = require("express-validator");

const LISTING_STATUSES = [
  "available",
  "claimed",
  "collected",
  "delivered",
  "expired",
  "cancelled",
];

const CLAIM_STATUSES = ["claimed", "collected", "cancelled"];
const USER_ROLES = ["provider", "volunteer", "ngo", "admin"];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const first = errors.array()[0];
  return res.status(400).json({
    success: false,
    error: {
      message: first.msg,
    },
  });
}

const createListingRules = [
  body("provider_name").trim().notEmpty().withMessage("provider_name is required"),
  body("food_type").trim().notEmpty().withMessage("food_type is required"),
  body("quantity")
    .exists()
    .withMessage("quantity is required")
    .isFloat({ gt: 0 })
    .withMessage("quantity must be a number greater than 0"),
  body("available_until")
    .notEmpty()
    .withMessage("available_until is required")
    .isISO8601()
    .withMessage("available_until must be a valid date"),
  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),
  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),
  handleValidation,
];

const updateListingRules = [
  body("provider_name").optional().trim().notEmpty().withMessage("provider_name cannot be empty"),
  body("food_type").optional().trim().notEmpty().withMessage("food_type cannot be empty"),
  body("quantity")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("quantity must be a number greater than 0"),
  body("available_until")
    .optional()
    .isISO8601()
    .withMessage("available_until must be a valid date"),
  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),
  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),
  handleValidation,
];

const listingIdRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  handleValidation,
];

const listingStatusRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  body("status")
    .isIn(LISTING_STATUSES)
    .withMessage(`status must be one of: ${LISTING_STATUSES.join(", ")}`),
  handleValidation,
];

const nearbyRules = [
  query("latitude")
    .exists()
    .withMessage("latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),
  query("longitude")
    .exists()
    .withMessage("longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),
  query("radius")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("radius must be a number greater than 0"),
  handleValidation,
];

const claimListingRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  body("volunteer_id")
    .isInt({ gt: 0 })
    .withMessage("volunteer_id must be a positive integer"),
  handleValidation,
];

const createUserRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("role")
    .isIn(USER_ROLES)
    .withMessage(`role must be one of: ${USER_ROLES.join(", ")}`),
  handleValidation,
];

const userIdRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  handleValidation,
];

const claimIdRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  handleValidation,
];

const claimStatusRules = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
  body("status")
    .isIn(CLAIM_STATUSES)
    .withMessage(`status must be one of: ${CLAIM_STATUSES.join(", ")}`),
  handleValidation,
];

module.exports = {
  LISTING_STATUSES,
  CLAIM_STATUSES,
  USER_ROLES,
  createListingRules,
  updateListingRules,
  listingIdRules,
  listingStatusRules,
  nearbyRules,
  claimListingRules,
  createUserRules,
  userIdRules,
  claimIdRules,
  claimStatusRules,
};

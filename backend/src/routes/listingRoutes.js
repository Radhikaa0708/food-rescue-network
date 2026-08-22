const express = require("express");
const listingController = require("../controllers/listingController");
const claimController = require("../controllers/claimController");
const {
  createListingRules,
  updateListingRules,
  listingIdRules,
  listingStatusRules,
  nearbyRules,
  claimListingRules,
} = require("../middleware/validation");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/nearby", nearbyRules, listingController.getNearbyListings);
router.get("/", listingController.getListings);
router.post("/", createListingRules, listingController.createListing);
router.get("/:id", listingIdRules, listingController.getListingById);
router.put("/:id", listingIdRules, updateListingRules, listingController.updateListing);
router.patch(
  "/:id/status",
  listingStatusRules,
  listingController.updateListingStatus
);
router.post("/:id/claim", requireAuth, claimListingRules, claimController.claimListing);

module.exports = router;

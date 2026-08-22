const express = require("express");
const claimController = require("../controllers/claimController");
const { claimIdRules, claimStatusRules } = require("../middleware/validation");

const router = express.Router();

router.get("/", claimController.getClaims);
router.get("/:id", claimIdRules, claimController.getClaimById);
router.patch("/:id/status", claimStatusRules, claimController.updateClaimStatus);

module.exports = router;

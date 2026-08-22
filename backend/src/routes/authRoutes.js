const express = require("express");
const authController = require("../controllers/authController");
const { authRegisterRules, authLoginRules } = require("../middleware/validation");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authRegisterRules, authController.register);
router.post("/login", authLoginRules, authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", authController.logout);

module.exports = router;
const express = require("express");
const userController = require("../controllers/userController");
const { createUserRules, userIdRules } = require("../middleware/validation");

const router = express.Router();

router.get("/", userController.getUsers);
router.post("/", createUserRules, userController.createUser);
router.get("/:id", userIdRules, userController.getUserById);

module.exports = router;

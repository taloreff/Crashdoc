const express = require("express");
const {
  createUser,
  login,
  updateUserProfile,
  getUserByID,
  getUserByEmail,
} = require("../controllers/userController.js");
const router = express.Router();

router.post("/", createUser);

router.get("/:userId", getUserByID);

router.get("/email/:userEmail", getUserByEmail);

router.post("/login", login);

router.put("/:userId", updateUserProfile);

module.exports = router;

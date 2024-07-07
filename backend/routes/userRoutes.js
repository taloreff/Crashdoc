const express = require("express");
const {
  createUser,
  login,
  updateUser,
  getUserByID,
  getUserByEmail,
  updateUserEmail,
} = require("../controllers/userController.js");
const router = express.Router();

router.post("/", createUser);

router.get("/:userId", getUserByID);

router.get("/email/:userEmail", getUserByEmail);

router.post("/login", login);

router.put("/:userId", updateUser);

router.put("/update-email/:userId", updateUserEmail);

module.exports = router;

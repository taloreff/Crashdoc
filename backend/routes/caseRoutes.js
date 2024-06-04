const express = require("express");
const jwt = require("jsonwebtoken");

const {
  createCase,
  getAllCases,
  getCasesByUser,
  updateCase,
  deleteCase,
  getCaseById,
} = require("../controllers/caseController.js");

const router = express.Router();

router.post("/", createCase);

router.get("/", getAllCases);

router.get("/:caseId", getCaseById);

router.get("/user/:userId", getCasesByUser);

router.put("/:id", updateCase);

router.delete("/:id", deleteCase);

module.exports = router;

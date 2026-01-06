const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const {
  verifyMarksByTeacher,
  getVerificationStatus,
  reopenMarks
} = require("../controllers/classVerificationController");

// ------------------------------
// TEACHER → VERIFY / FINALIZE
// ------------------------------
router.put("/verify", authenticate, verifyMarksByTeacher);

// ------------------------------
// ADMIN → VIEW STATUS
// ------------------------------
router.get("/status", authenticate, adminOnly, getVerificationStatus);

// ------------------------------
// ADMIN → REOPEN MARKS
// ------------------------------
router.put("/reopen", authenticate, adminOnly, reopenMarks);

module.exports = router;

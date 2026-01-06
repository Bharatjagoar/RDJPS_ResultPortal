const express = require("express");
const authenticate = require("../middleware/auth.js");
const isAdmin = require("../middleware/adminOnly.js");
const {
  searchTeachers,
  getTeacherActivities
} = require("../controllers/adminController.js");

const router = express.Router();

// 🔐 All routes protected
router.use(authenticate, isAdmin);

// 🔍 Search teachers by username
router.get("/teachers/search", searchTeachers);

// 📜 Fetch teacher activity logs
router.get("/teachers/:teacherId/activities", getTeacherActivities);

module.exports = router;

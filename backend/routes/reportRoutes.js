const express = require("express");
const router = express.Router();
const { sendReportCardEmail } = require("../controllers/reportController");

router.post("/send-report/:studentId", sendReportCardEmail);

module.exports = router;
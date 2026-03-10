const express = require("express");
const router = express.Router();

const { uploadPerforma ,getPerformaByClassSection } = require("../controllers/performaController");

router.post("/upload/:classId/:section", uploadPerforma);
router.get("/get/:classId/:section", getPerformaByClassSection);

module.exports = router;
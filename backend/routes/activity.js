const router = require("express").Router();
const authenticate = require("../middleware/auth");
const controller = require("../controllers/adminActivityController");

router.get("/my", authenticate, controller.getMyActivity);

module.exports = router;

const express = require("express");
const { 
  signup, 
  verifyOtp, 
  cancelSignup, 
  resendOtp,
  checkStatus,
  login,  // ⭐ Add this
  checkForAdmin,
  resetPassword,
  verifyResetOtp,
  forgotPassword
} = require("../controllers/authController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/cancel", cancelSignup);
router.post("/resend-otp", resendOtp);
router.post("/login", login);  // ⭐ Add this
router.get("/check-status", checkStatus);
router.get("/admin-exists",checkForAdmin);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);


// ⭐ Protected route example (use authenticate middleware)
router.get("/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
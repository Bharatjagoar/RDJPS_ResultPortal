const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// 🔥 Auto-delete expired OTPs
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordReset", passwordResetSchema);

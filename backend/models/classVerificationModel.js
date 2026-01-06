const mongoose = require("mongoose");

const classVerificationSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher"
    }
  },
  { timestamps: true }
);

// Prevent duplicate records
classVerificationSchema.index(
  { class: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ClassVerification",
  classVerificationSchema
);

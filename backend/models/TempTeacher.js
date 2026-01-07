const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TempTeacherSchema = new mongoose.Schema({
  username: String,
  email: String,
  isAdmin: Boolean,

  // ⭐ NEW
  classTeacherOf: {
    className: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    }
  },

  password: String,
  otp: String,

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // ⭐ THIS is the key
  },
  createdAt: {
  type: Date,
  default: Date.now
}
});


// ⭐ Hash password before saving - Modern Mongoose syntax (no next needed)
TempTeacherSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("TempTeacher", TempTeacherSchema);
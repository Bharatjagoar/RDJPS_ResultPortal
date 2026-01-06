const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TeacherSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  isAdmin: {
    type: Boolean,
    required: true
  },

  // ⭐ NEW: Class Teacher Assignment
  classTeacherOf: {
    className: {
      type: String, // e.g. "9"
      required: true
    },
    section: {
      type: String, // e.g. "C"
      required: true,
      uppercase: true,
      trim: true
    }
  },

  password: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


// ⭐ Hash password only if it's not already a bcrypt hash
TeacherSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // ⭐ Check if password is already a bcrypt hash (starts with $2a$ or $2b$)
  const isBcryptHash = /^\$2[aby]\$/.test(this.password);

  if (isBcryptHash) {
    console.log("Password already hashed, skipping...");
    return; // Skip hashing if already hashed
  }

  console.log("Hashing new password...");
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
TeacherSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Teacher", TeacherSchema);
const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    action: {
      type: String,
      enum: ["BULK_UPLOAD", "UPDATE_MARKS"],
      required: true
    },

    entity: {
      type: String,
      enum: ["CLASS", "STUDENT"],
      required: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    classId: String,

    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);

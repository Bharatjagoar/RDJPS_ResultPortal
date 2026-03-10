const mongoose = require("mongoose");

const studentPerformaSchema = new mongoose.Schema(
  {
    rollNo: String,
    name: String,

    marks: {
      type: Object,
      default: {}
    }
  },
  { _id: false }
);

const performaSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true
    },

    section: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    headers: {
      type: [String],
      default: []
    },

    students: {
      type: [studentPerformaSchema],
      default: []
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Performa", performaSchema);
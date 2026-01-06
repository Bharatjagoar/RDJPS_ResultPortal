const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  internals: { type: Number, required: true, min: 0, max: 20 },
  midTerm: { type: Number, required: true, min: 0, max: 30 },
  finalTerm: { type: Number, required: true, min: 0, max: 50 },
  total: { type: Number, required: true, min: 0, max: 100 },
  grade: { 
    type: String, 
    default:null
  }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  examRollNo: { type: Number, required: true, unique: true },
  class: { type: String, required: true },
  dob: { type: String, },
  admissionNo: { type: Number, required: true, unique: true },
  house: { 
    type: String, 
    required: true, 
    enum: ['Vallabhi', 'Pushpagiri', 'Takshshila', 'Nalanda'] 
  },
  subjects: {
  type: mongoose.Schema.Types.Mixed,
  required: true
}
,
  overallGrade: { type: String, default: null },
  result: { type: String, default: null },
  grandTotal: { type: Number, required: true, min: 0 }
}, { timestamps: true });

studentSchema.index({ examRollNo: 1 });
studentSchema.index({ admissionNo: 1 });
studentSchema.index({ class: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
const Student = require("../models/Student");
const generateReportPdf = require("../utils/generateReportPdf");
const sendEmailWithAttachment = require("../utils/sendEmailWithAttachment");

exports.sendReportCardEmail = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Fetch student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Generate PDF buffer
    const pdfBuffer = await generateReportPdf(student);

    // 3️⃣ Send email with attachment
    await sendEmailWithAttachment(
      student.email,
      "Your Report Card",
      "Please find your attached report card.",
      pdfBuffer,
      `${student.name}-Report.pdf`
    );

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send report" });
  }
};
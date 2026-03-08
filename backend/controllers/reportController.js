const Student = require("../models/Student");
const generateReportPdf = require("../utils/generateReportPdf");
const sendEmailWithAttachment = require("../utils/sendEmailWithAttachment");
const { extractClassAndSection, getSectionFullName, getSmallOrdinal } = require("../utils/utility");

exports.sendReportCardEmail = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Fetch student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.emailSent) {
      return res.status(400).json({
        message: "Email already sent for this student"
      });
    }
    const { className, section } = extractClassAndSection(student.class);
    const classname = getSectionFullName(className, section);
    const ord = getSmallOrdinal(className);
    const subject = "Result Declaration for " + ord + " " + classname;

    console.log(subject);
    // 2️⃣ Generate PDF buffer
    const pdfBuffer = await generateReportPdf(student);

    // 3️⃣ Send email with attachment
    const response = await sendEmailWithAttachment(
      student.email,
      subject,
      "Please find your attached report card.",
      pdfBuffer,
      `${student.name}-Report.pdf`
    );

    // ⭐ Brevo accepted the email
    if (response.messageId) {

      student.emailSent = true;
      student.emailSentAt = new Date();
      student.emailMessageId = response.messageId;

      await student.save();
    }


    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send report" });
  }
};
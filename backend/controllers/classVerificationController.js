const ClassVerification = require("../models/classVerificationModel.js");

// ------------------------------------
// TEACHER → VERIFY MARKS
// ------------------------------------
exports.verifyMarksByTeacher = async (req, res) => {
  try {
    const { className, section } = req.body;
    const teacher = req.user;

    // Only class teacher allowed
    if (
      !teacher.classTeacherOf ||
      teacher.classTeacherOf.className !== className ||
      teacher.classTeacherOf.section !== section
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this class"
      });
    }

    const record = await ClassVerification.findOneAndUpdate(
      { class: className, section },
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: teacher._id
      },
      { upsert: true, new: true }
    );
    console.log(record,"record");
    return res.status(200).json({
      success: true,
      message: `Marks finalized for Class ${className} ${section}`,
      data: record
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ------------------------------------
// ADMIN → VIEW ALL VERIFICATION STATUS
// ------------------------------------
exports.getVerificationStatus = async (req, res) => {
  console.log("windows");
  try {
    const { className, section } = req.query;

    let filter = {};
    if (className && section) {
      filter = { class: className, section };
    }

    const records = await ClassVerification.find(filter)
      .populate("verifiedBy", "username email");

    return res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error("STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// ------------------------------------
// ADMIN → REOPEN MARKS
// ------------------------------------
exports.reopenMarks = async (req, res) => {
  try {
    const { className, section } = req.body;

    const record = await ClassVerification.findOneAndUpdate(
      { class: className, section },
      {
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null
      },
      { new: true }
    );
    console.log("updated ",record);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Marks reopened for Class ${className} ${section}`
    });

  } catch (error) {
    console.error("REOPEN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

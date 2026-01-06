const PasswordReset = require("../models/PasswordReset");
const Teacher = require("../models/Teacher");
const sendEmail = require("../utils/sendEmail");

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always send same response (security)
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.json({
        success: true,
        message: "If the email exists, OTP has been sent"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTPs
    await PasswordReset.deleteMany({ email });

    await PasswordReset.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendEmail(email, `Your password reset OTP is ${otp}`);

    return res.json({
      success: true,
      message: "If the email exists, OTP has been sent"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const TempTeacher = require("../models/TempTeacher.js")
const Teacher = require("../models/Teacher.js")
const sendEmail = require("../utils/sendEmail.js");
const { generateToken } = require("../utils/jwt");
const PasswordReset = require("../models/PasswordReset");

// ─────────────────────────────────────────────
// 1. Signup → Generate OTP
// ─────────────────────────────────────────────

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password, isAdmin, className, section } = req.body;

    if (!className || !section) {
      return res.status(400).json({
        success: false,
        message: "Class and Section are required"
      });
    }

    // 🔍 Check existing teacher
    const existingTeacher = await Teacher.findOne({ email });
    const existingTemp = await TempTeacher.findOne({ email });

    if (existingTeacher || existingTemp) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // 🔐 Admin logic
    const adminExists = await Teacher.exists({ isAdmin: true });
    const finalIsAdmin = !adminExists && isAdmin === true;

    // 🔁 OPTIONAL (Recommended):
    // Ensure only ONE class teacher per class+section
    const classTeacherExists = await Teacher.findOne({
      "classTeacherOf.className": className,
      "classTeacherOf.section": section.toUpperCase()
    });

    if (classTeacherExists) {
      return res.status(400).json({
        success: false,
        message: "Class teacher already assigned for this class"
      });
    }

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    await TempTeacher.create({
      username,
      email,
      password,
      otp,
      isAdmin: finalIsAdmin,
      classTeacherOf: {
        className,
        section
      },
      expiresAt: new Date(Date.now() + 3 * 60 * 1000)
    });

    await sendEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


module.exports.checkAdminExists = async (req, res) => {
  const adminExists = await Teacher.exists({ isAdmin: true });

  return res.json({
    adminExists: !!adminExists
  });
};



// ─────────────────────────────────────────────
// 2. Verify OTP
// ─────────────────────────────────────────────
module.exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await TempTeacher.findOne({ email });

    if (!record)
      return res.json({ success: false, message: "OTP expired" });

    if (record.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    const teacher = await Teacher.create({
      username: record.username,
      email: record.email,
      password: record.password, // already hashed
      isAdmin: record.isAdmin,
      classTeacherOf: record.classTeacherOf
    });

    await TempTeacher.deleteOne({ email });

    const token = generateToken(
      teacher._id,
      teacher.email,
      teacher.isAdmin
    );

    return res.json({
      success: true,
      message: "Verification successful",
      token,
      user: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        classTeacherOf: teacher.classTeacherOf
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// ─────────────────────────────────────────────
// 3. Cancel signup
// ─────────────────────────────────────────────
module.exports.cancelSignup = async (req, res) => {
  try {
    console.log("getting cancel :: -- >> ")
    const { email } = req.body;
    await TempTeacher.deleteOne({ email });

    return res.json({
      success: true,
      message: "Signup cancelled",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // check if email was in signup process
    const user = await TempTeacher.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found. Please signup again."
      });
    }

    // generate new otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    // save OTP in DB
    await TempTeacher.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true }
    );

    // send email
    await sendEmail(
      email,
      `Your new OTP is: ${otp}`
    );

    return res.json({
      success: true,
      message: "OTP resent successfully"
    });
  } catch (error) {
    console.log("RESEND OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};


// ─────────────────────────────────────────────
// 4. Check if user is verified
// ─────────────────────────────────────────────
module.exports.checkStatus = async (req, res) => {
  console.log("this is ht eOTP verify !! ");
  try {
    const { email } = req.query; // or get from token if using JWT

    // Check if user exists in Teacher collection (verified)
    const teacher = await Teacher.findOne({ email });

    if (teacher) {
      return res.json({
        success: true,
        isVerified: true,
        email: teacher.email
      });
    }

    // Check if still in temp (pending verification)
    const tempTeacher = await TempTeacher.findOne({ email });

    if (tempTeacher) {
      return res.json({
        success: true,
        isVerified: false,
        email: tempTeacher.email,
        hasPendingOTP: true
      });
    }

    // User doesn't exist
    return res.json({
      success: false,
      isVerified: false,
      message: "User not found"
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. Login
// ─────────────────────────────────────────────
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find teacher
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await teacher.comparePassword(password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(teacher._id, teacher.email);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        isAdmin:teacher.isAdmin,
        classTeacherOf:teacher.classTeacherOf
      }
    });

  } catch (error) {
    console.log("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports.checkForAdmin = async (req, res) => {
  console.log(req.body);
  try {
    const checkteacher = await Teacher.findOne({ isAdmin: true })
    console.log(checkteacher);
    if (!checkteacher) {
      return res.status(200).json({
        adminExists: false,
        message: "Admin does not exist"
      })
    }

    return res.status(200).json({
      adminExists: true,
      message: "Admin exist"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

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


module.exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await PasswordReset.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    record.verified = true;
    await record.save();

    return res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const record = await PasswordReset.findOne({ email, verified: true });

    if (!record) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized password reset"
      });
    }

    const teacher = await Teacher.findOne({ email });

    teacher.password = newPassword; // hashing via pre-save
    await teacher.save();

    // Invalidate OTP
    await PasswordReset.deleteMany({ email });

    return res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

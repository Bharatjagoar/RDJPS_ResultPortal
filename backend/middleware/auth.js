const { verifyToken } = require("../utils/jwt");
const Teacher = require("../models/Teacher");

const authenticate = async (req, res, next) => {
  // console.log("hellwo")
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Check if user exists
    const teacher = await Teacher.findById(decoded.id).select("-password");
    console.log(teacher);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Attach user to request
    req.user = teacher;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = authenticate;
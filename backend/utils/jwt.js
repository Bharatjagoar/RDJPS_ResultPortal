const jwt = require("jsonwebtoken");

// Use environment variable for secret (add to .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

// Generate JWT token
function generateToken(id, email, isAdmin) {
  return jwt.sign(
    { id, email, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}


// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken, JWT_SECRET };
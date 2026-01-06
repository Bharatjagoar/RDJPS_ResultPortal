const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

module.exports = async (to, otp) => {

  console.log("USER:", process.env.EMAIL_USER);
  console.log("PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Verification OTP",
    text: `Your OTP for verification is: ${otp}\nThis OTP expires in 3 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};

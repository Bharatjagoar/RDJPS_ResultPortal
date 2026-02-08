import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "./utils";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      console.log(res);
      if (res.data.success) {
        toast.success("If the email exists, OTP has been sent");

        // 🔑 move to OTP verification page
        navigate("/verify-reset-otp", {
          state: { email }
        });
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot Password</h2>

        <div className="forgot-input-group">
          <label>Registered Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="forgot-btn"
          onClick={handleSendOtp}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p
          className="back-to-login"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

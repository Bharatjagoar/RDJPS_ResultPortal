import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "./utils";
import { toast } from "react-toastify";
import OtpInput from "../components/OtpInput";
import "./VerifyResetOtp.css";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Safety guard
  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "http://localhost:5000/api/auth/verify-reset-otp",
        { email, otp }
      );

      if (res.data.success) {
        toast.success("OTP verified");

        // 👉 move to reset password page
        navigate("/reset-password", {
          state: { email }
        });
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify OTP</h2>
        <p className="verify-subtext">
          Enter the OTP sent to <b>{email}</b>
        </p>

        <OtpInput value={otp} onChange={setOtp} />

        <button
          className="verify-btn"
          onClick={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyResetOtp;

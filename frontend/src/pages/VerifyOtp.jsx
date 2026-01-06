import React, { useEffect, useState } from "react";
import "./VerifyOTP.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { saveOTPState, getOTPState, clearOTPState } from "./utils";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();

  // ⭐ Initialize: Check for existing OTP state or new signup
  // ⭐ Initialize: Check for existing OTP state or new signup
useEffect(() => {
  const initialize = async () => {
    // Try to restore OTP state from localStorage
    const savedState = getOTPState();
    
    if (savedState) {
      // Check if this email is already verified
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/check-status?email=${savedState.email}`
        );
        
        if (res.data.isVerified) {
          clearOTPState();
          toast.info("You're already verified! Please login.");
          navigate("/login");
          return;
        }
        
        // ⭐ Check if this is a new signup or a page refresh
        if (state?.email) {
          // Coming from signup page (fresh navigation)
          setEmail(state.email);
          const expiryTime = Date.now() + 180000; // 3 minutes from now
          saveOTPState(state.email, expiryTime);
          setTimeLeft(180);
          // Don't show "restored" message - this is a new signup
        } else {
          // No state from navigation = page refresh/reload
          if (res.data.hasPendingOTP) {
            setEmail(savedState.email);
            setTimeLeft(savedState.timeLeft);
            toast.info("OTP verification session restored"); // ✅ Only show here
          } else {
            // No pending OTP - redirect to signup
            clearOTPState();
            toast.error("OTP session expired. Please sign up again.");
            navigate("/signup");
            return;
          }
        }
      } catch (err) {
        console.error("Status check failed:", err);
        
        // ⭐ Even on error, check if coming from signup
        if (state?.email) {
          // Fresh signup
          setEmail(state.email);
          const expiryTime = Date.now() + 180000;
          saveOTPState(state.email, expiryTime);
          setTimeLeft(180);
        } else {
          // Page refresh - restore saved state
          setEmail(savedState.email);
          setTimeLeft(savedState.timeLeft);
          toast.info("OTP verification session restored");
        }
      }
    } else if (state?.email) {
      // New signup flow (no saved state exists)
      setEmail(state.email);
      const expiryTime = Date.now() + 180000; // 3 minutes from now
      saveOTPState(state.email, expiryTime);
      setTimeLeft(180);
    } else {
      // No valid state - redirect to signup
      toast.error("Please sign up first");
      navigate("/signup");
      return;
    }

    setIsInitialized(true);
  };

  initialize();
}, [state, navigate]);

  // ⭐ Timer logic with persistence
  useEffect(() => {
    if (!isInitialized || !email) return;

    if (timeLeft <= 0) {
      clearOTPState();
      toast.error("OTP expired. Please sign up again.");
      navigate("/signup");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Update localStorage every second
        if (email) {
          const expiryTime = Date.now() + newTime * 1000;
          saveOTPState(email, expiryTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, email, isInitialized, navigate]);

  // ⭐ Cleanup on unmount (when leaving page intentionally)
  useEffect(() => {
    return () => {
      // Don't clear if navigating to success
      const currentPath = window.location.pathname;
      if (currentPath === "/verify-otp") {
        // Still on verify page, keep state
        return;
      }
      // If navigating away (back button, etc), clear state
      clearOTPState();
    };
  }, []);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // 🔐 VERIFY OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        // Save auth token if provided
        if (res.data.token) {
          localStorage.setItem('authToken', res.data.token);
        }
        
        // Clear OTP state after successful verification
        clearOTPState();
        
        toast.success("Account verified successfully!");
        navigate("/login");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    try {
      const newTimeLeft = 180;
      setTimeLeft(newTimeLeft);
      setOtp("");

      // Update localStorage with new expiry
      const expiryTime = Date.now() + newTimeLeft * 1000;
      saveOTPState(email, expiryTime);

      await axios.post("http://localhost:5000/api/auth/resend-otp", { email });

      toast.success("OTP resent successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Don't render until initialized
  if (!isInitialized || !email) {
    return (
      <div className="otp-container">
        <div className="otp-box">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Verify OTP</h2>
        <p className="otp-description">
          Enter the OTP sent to: <b>{email}</b>
        </p>

        <p className="timer">
          OTP expires in: <span>{formatTime()}</span>
        </p>

        <form onSubmit={handleVerify}>
          <div className="otp-input-group">
            <input
              type="text"
              maxLength={6}
              placeholder="______"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>

          <button disabled={timeLeft <= 0 || loading} type="submit" className="otp-btn">
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="otp-footer">
          Didn't receive OTP?{" "}
          <span onClick={handleResend} className="resend-btn">
            Resend
          </span>
        </p>
        
        <p className="otp-footer">
          <span onClick={() => {
            clearOTPState();
            navigate("/signup");
          }} className="back-link">
            ← Back to Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
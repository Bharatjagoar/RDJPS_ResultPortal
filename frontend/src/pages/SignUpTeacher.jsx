import React, { useEffect, useState } from "react";
import "./SignUpTeacher.css";
import { api } from "./utils";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    Confirmpassword: "",
    className: "",
    section: ""
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminExists, setAdminExists] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCNFPassword, setShowCNFPassword] = useState(false);

  const navigate = useNavigate();

  // 🔑 CHECK IF ADMIN EXISTS
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get("/auth/admin-exists");
        const data = await res.data;
        setAdminExists(data.adminExists);
      } catch (err) {
        console.error("Failed to check admin status", err);
      }
    };

    checkAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-capitalize Section / Stream
    if (name === "section") {
      setForm({
        ...form,
        [name]: value.toUpperCase()
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };


  const clickme = () => {
    navigate("/login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.Confirmpassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    // Only validate class & section if NOT admin signup
    const isAdminSignup = !adminExists && isAdmin;

    if (!isAdminSignup) {
      if (!form.className || !form.section) {
        setError("Class and Section / Stream are required");
        setLoading(false);
        return;
      }

      const classNum = Number(form.className);
      if (isNaN(classNum) || classNum < 1 || classNum > 12) {
        setError("Class must be a number between 1 and 12");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await api.post("/auth/signup", {
        username: form.username,
        email: form.email,
        password: form.password,
        className: form.className,
        section: form.section,
        isAdmin: !adminExists && isAdmin,
      });

      const data = res.data;

      if (!data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Server error, please try again later."
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>

        {/* 🔑 ADMIN OPTION */}
        {!adminExists && (
          <div className="admin-option">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span>
                Sign up as Admin <small>(first time setup)</small>
              </span>
            </label>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* ⭐ CLASS & SECTION — ONLY FOR NON-ADMIN */}
          {!(isAdmin && !adminExists) && (
            <>
              <div className="input-group academic">
                <label>Class</label>
                <input
                  type="text"
                  name="className"
                  placeholder="e.g. 9, 10, 11, 12"
                  value={form.className}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group academic">
                <label>Section / Stream</label>
                <input
                  type="text"
                  name="section"
                  placeholder="e.g. A, C, Science, Commerce"
                  value={form.section}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}


          <div className="input-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div className="input-group password-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showCNFPassword ? "text" : "password"}
                name="Confirmpassword"
                placeholder="Re-enter your password"
                value={form.Confirmpassword}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowCNFPassword(!showCNFPassword)}
              >
                {showCNFPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <span onClick={clickme}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import { api } from "../pages/utils";
import "./Navbar.css";
import { useState } from "react";

const Navbar = ({ onResetEmail }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from redux
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Get initials from username
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const handleResetEmail = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const classId = `${user.classTeacherOf.className} ${user.classTeacherOf.section}`;

    if (!window.confirm("Reset all marks for your class?"))
      return;

    try {

      await api.post(`/students/reset-email/${user.classTeacherOf.className}/${user.classTeacherOf.section}`);
      // console.log(localStorage.getItem("sentReportEmails"))
      localStorage.removeItem("sentReportEmails");
      onResetEmail();


      toast.success("Email data reset successfully");

    } catch (err) {
      console.log(err)
      toast.error("Failed to reset email data");

    }
  };

  const handleResetClass = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const classId = `${user.classTeacherOf.className} ${user.classTeacherOf.section}`;

    if (!window.confirm("This will delete all class data. Continue?"))
      return;

    try {

      await api.post(`/students/reset-class/${user.classTeacherOf.className}/${user.classTeacherOf.section}`);

      toast.success("Class data deleted");

    } catch (err) {

      toast.error("Failed to reset class");

    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <div
          className="navbar-brand"
          onClick={() => navigate("/")}
        >
          <span className="brand-text">School Portal</span>
        </div>

        {/* Right side */}
        <div className="navbar-right">

          {/* ✅ Admin Dashboard button (ADMIN ONLY) */}
          {user?.isAdmin && (
            <button
              className="admin-btn"
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </button>
          )}

          {/* User Avatar */}
          {showMenu && (
            <div className="avatar-menu">

              <button
                className="menu-item"
                onClick={() => handleResetEmail()}
              >
                Reset Email Data
              </button>

              <button
                className="menu-item danger"
                onClick={() => handleResetClass()}
              >
                Reset Class Data
              </button>

            </div>
          )}
          <div
            className="user-avatar"
            onClick={() => setShowMenu(!showMenu)}
          >
            {getInitials(user?.username)}
          </div>

          {/* Logout */}
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

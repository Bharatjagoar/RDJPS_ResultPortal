import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from redux
  const { user } = useSelector((state) => state.auth);

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
          <div className="user-avatar">
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

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "../redux/slices/authSlice";

const AdminRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // ⏳ while auth state is resolving
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white"
      }}>
        Checking permissions...
      </div>
    );
  }

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but NOT admin
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin allowed
  return children;
};

export default AdminRoute;

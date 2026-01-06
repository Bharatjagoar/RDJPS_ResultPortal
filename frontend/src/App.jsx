import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import HomePage from "./components/HomePage.jsx";
import WingPage from "./pages/wingpage.jsx"; // ⭐ Import WingPage
import ClassPage from "./pages/ClassPage.jsx";
import ExcelUploadPage from "./pages/ExcelUploadPage.jsx";
import Signup from "./pages/SignUpTeacher.jsx";
import VerifyOTP from "./pages/VerifyOtp.jsx";
import Login from "./pages/loginPage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import ClassRecordsPage from "./pages/ClassRecord.jsx";
import ActivityLogPage from "./pages/ActivityLogPage.jsx";
import ReportCard from "./components/ReportCard.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import AdminRoute from "./components/AdminRoute.jsx";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Protected Routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          {/* ⭐ Single dynamic wing route */}
          <Route path="/:wingName" element={
            <ProtectedRoute>
              <WingPage />
            </ProtectedRoute>
          } />

          <Route path="/class/:classId" element={
            <ProtectedRoute>
              <ClassPage />
            </ProtectedRoute>
          } />

          <Route path="/class/:classId/excel" element={
            <ProtectedRoute>
              <ExcelUploadPage />
            </ProtectedRoute>
          } />

          <Route
            path="/class/:classId/records"
            element={
              <ProtectedRoute>
                <ClassRecordsPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />


          <Route path="/activity" element={
            <ProtectedRoute>
              <ActivityLogPage />
            </ProtectedRoute>
          } />


          {/* Public Routes - redirect to home if authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* OTP verification - special case */}
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/checkit" element={<ReportCard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="reset-password" element={<ResetPassword />} />

        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" />
    </Provider>
  );
}

export default App;
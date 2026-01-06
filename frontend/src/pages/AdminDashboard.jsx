import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchEmployeeTab from "../components/admin/SearchEmployeeTab";
import MarksVerificationTab from "../components/admin/MarksVerificationTab";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("teacher");

  return (
    <>
      <Navbar />

      <div className="admin-container">
        <div className="admin-inner">
          <h2>Admin Dashboard</h2>

          <div className="admin-tabs">
            <button
              className={activeTab === "teacher" ? "active" : ""}
              onClick={() => setActiveTab("teacher")}
            >
              Search Employee
            </button>

            <button
              className={activeTab === "verification" ? "active" : ""}
              onClick={() => setActiveTab("verification")}
            >
              Marks Verification
            </button>
          </div>

          {activeTab === "teacher" && <SearchEmployeeTab />}

          {activeTab === "verification" && <MarksVerificationTab />}

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

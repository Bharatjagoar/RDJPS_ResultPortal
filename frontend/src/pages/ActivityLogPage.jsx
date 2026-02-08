import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "./utils";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./ActivityLogPage.css";

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await api.get(
        "http://localhost:5000/api/activity/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setLogs(res.data.data);
    } catch (error) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString();

  return (
    <>
      <Navbar />
      <div className="activity-container">
        <h1 className="activity-title">My Activity</h1>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : logs.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <div className="activity-logs">
            {logs.map((log) => (
              <div key={log._id} className="activity-card">
                <div className="activity-header">
                  <span className="activity-action">{log.action}</span>
                  <span className="activity-time">
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                <div className="activity-body">
                  <p>{log.description}</p>

                  {log.classId && (
                    <p>
                      <strong>Class:</strong> {log.classId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLogPage;

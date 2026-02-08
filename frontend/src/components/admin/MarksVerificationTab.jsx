import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../pages/utils";
import ClassSectionSearch from "./ClassSectionSearch";
import VerificationTable from "./VerificationTable";

const MarksVerificationTab = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  // 🔹 1. Fetch ALL on page load
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "http://localhost:5000/api/class-verification/status",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 2. Fetch ONE on search
  const handleSearch = async ({ className, section }) => {
    try {
      setLoading(true);

      const res = await api.get(
        "http://localhost:5000/api/class-verification/status",
        {
          params: { className, section },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRecords(res.data.data); // single record array
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ClassSectionSearch onSearch={handleSearch} />

      {loading ? (
        <p>Loading verification records...</p>
      ) : (
        <VerificationTable records={records} onRefresh={fetchAll} />
      )}
    </>
  );
};

export default MarksVerificationTab;

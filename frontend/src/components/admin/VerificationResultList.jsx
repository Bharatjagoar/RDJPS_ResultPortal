import { useEffect, useState } from "react";
import axios from "axios";
import "./VerificationResultList.css";

const VerificationResultList = ({ query }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `http://localhost:5000/api/verification/status`,
          {
            params: {
              className: "9",
              section: "b",
            },
          }
        );

        setData(res.data);
      } catch (err) {
        setError("Failed to fetch verification data");
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [query]);

  if (loading) return <p>Loading verification data...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="verification-results">
      <h4>
        Class {query.className} - Section {query.section}
      </h4>

      <table>
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item.teacherName}</td>
              <td>
                <span className={item.isFinalized ? "final" : "pending"}>
                  {item.isFinalized ? "Finalized" : "Pending"}
                </span>
              </td>
              <td>{new Date(item.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationResultList;

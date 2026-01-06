import axios from "axios";
import "./VerificationTable.css";


const VerificationTable = ({ records, onRefresh }) => {
  const reopenMarks = async (className, section) => {
    // if (!window.confirm("Reopen marks for this class?")) return;

      const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        "http://localhost:5000/api/class-verification/reopen",
        { className, section },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      onRefresh();
    } catch (err) {
      console.error("Reopen error", err);
    }
  };

  if (records.length === 0) {
    return <p>No verification records found.</p>;
  }

  return (
    <div className="verification-table-wrapper">
      <table className="verification-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Section</th>
            <th>Status</th>
            <th>Verified By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.class}</td>
              <td>{r.section}</td>
              <td>
                <span
                  className={
                    r.isVerified ? "status-finalized" : "status-pending"
                  }
                >
                  {r.isVerified ? "Finalized" : "Pending"}
                </span>
              </td>
              <td>{r.verifiedBy?.username || "-"}</td>
              <td>
                {r.isVerified && (
                  <button
                    className="reopen-btn"
                    onClick={() => reopenMarks(r.class, r.section)}
                  >
                    Reopen
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default VerificationTable;

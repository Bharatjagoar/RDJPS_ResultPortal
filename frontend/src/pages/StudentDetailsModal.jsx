import React, { useEffect, useState } from "react";
import "./StudentDetailsModal.css";
import { hasAnyMarks, buildColumnSchema, formatHeaderLabel, orderColumnKeys } from "./utils";

const StudentDetailsModal = ({ isOpen, onClose, student, subjectMap }) => {
  const [blocks, setBlocks] = useState([]);
  const rawKeys = subjectMap ? buildColumnSchema(subjectMap) : [];
  const columnKeys = orderColumnKeys(rawKeys);

  useEffect(() => {
    if (!isOpen || !student || !subjectMap) return;

    const parsedBlocks = [];

    Object.entries(subjectMap).forEach(([subjectName, fields]) => {
      if (!fields || fields.length === 0) return;

      const subjectData = { subject: subjectName };


      fields.forEach(({ key, index }) => {
        const value = Number(student[index]) || 0;
        subjectData[key] = value;
      });



      if (hasAnyMarks(subjectData)) {
        parsedBlocks.push(subjectData);
      }

    });

    setBlocks(parsedBlocks);
  }, [isOpen, student, subjectMap]);

  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Subject-wise Breakdown</h2>

        <table className="details-table">
          <thead>
            <tr>
              <th>Subject</th>
              {columnKeys.map((key) => (
                <th key={key}>{formatHeaderLabel(key)}</th>
              ))}
            </tr>
          </thead>


          <tbody>
            {blocks.map((b, i) => (
              <tr key={i}>
                <td>{b.subject}</td>
                {columnKeys.map((key) => (
                  <td
                    key={key}
                    className={key === "total" ? "total-cell" : ""}
                  >
                    {b[key] ?? 0}
                  </td>
                ))}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDetailsModal;

import React, { useEffect, useState } from "react";
import "./StudentDetailsModal.css";

const StudentDetailsModal = ({ isOpen, onClose, student, mainHeaders, subHeaders }) => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (isOpen && student) {
      setBlocks(parseBlocks(student, mainHeaders, subHeaders));
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const parseBlocks = (row, mainHdrs, subHdrs) => {
    const blocks = [];
    let current = null;

    console.log("🔍 Starting parse with subHdrs length:", subHdrs.length);

    // ⭐ STEP 1: Loop through subHdrs.length, NOT mainHdrs.length
    for (let i = 8; i < subHdrs.length; i++) {
      const main = (mainHdrs[i] || "").trim();

      // ⭐ STEP 2: Clean up newlines and normalize to lowercase
      const sub = (subHdrs[i] || "")
        .replace(/\r?\n|\r/g, " ")  // Remove newlines
        .trim()
        .toLowerCase();

      console.log(`Index ${i}: main="${main}" | sub="${sub}" | value="${row[i]}"`);

      // Skip GRADE and Attendance
      if (main.toLowerCase() === "grade" || main.toLowerCase() === "attendance") {
        break;
      }

      // ⭐ STEP 3: Start of new subject (detect by "internals" keyword)
      if (sub.includes("internals")) {
        // Save previous subject
        if (current) {
          blocks.push(current);
          console.log("✅ Saved subject:", current.subject);
        }

        // Start new subject
        current = {
          subject: main || "Unknown",
          internals: row[i] || "0",
          mid: "0",
          final: "0",
          total: "0"
        };

        console.log("🆕 New subject started:", main);
        continue; // Move to next column
      }

      // If no current subject, skip
      if (!current) continue;

      // ⭐ STEP 4: Fill mid marks (check for "mid" keyword)
      if (sub.includes("mid") && !sub.includes("final")) {
        current.mid = row[i] || "0";
        console.log(`  📝 Mid marks for ${current.subject}: ${current.mid}`);
      }

      // ⭐ STEP 5: Fill final marks (check for "final" keyword)
      else if (sub.includes("final")) {
        current.final = row[i] || "0";
        console.log(`  📝 Final marks for ${current.subject}: ${current.final}`);
      }

      // ⭐ STEP 6: Fill total marks (check for "total" keyword)
      else if (sub.includes("total")) {
        current.total = row[i] || "0";
        console.log(`  📝 Total marks for ${current.subject}: ${current.total}`);
      }
    }

    // ⭐ STEP 7: Don't forget to save the last subject!
    if (current) {
      blocks.push(current);
      console.log("✅ Saved last subject:", current.subject);
    }

    console.log("🎯 Final blocks:", blocks);
    return blocks;
  };


  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>Subject-wise Breakdown</h2>

        <table className="details-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Internals</th>
              <th>Mid</th>
              <th>Final</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {blocks.map((b, i) => (
              <tr key={i}>
                <td>{b.subject}</td>
                <td>{b.internals}</td>
                <td>{b.mid}</td>
                <td>{b.final}</td>
                <td><strong>{b.total}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDetailsModal;

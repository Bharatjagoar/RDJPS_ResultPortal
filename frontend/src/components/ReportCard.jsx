import React, { forwardRef } from "react";
import "./ReportCard.css";

const ReportCard = forwardRef(
  ({ student, classId, section }, ref) => {

    const subjects = student.subjects || {};

    return (
      <div ref={ref} className="container">
        {/* HEADER */}
        <div className="header">
          <div className="school-name">
            RUKMANI DEVI JAIPURIA PUBLIC SCHOOL
          </div>
          <div className="school-subtitle">
            An English Medium Sr. Sec. Co-Educational School
          </div>
          <div className="school-address">
            23, Rajpur Road, Delhi-110054
          </div>
          <div className="record-title">
            Student's Academic Record 2023-24
          </div>
        </div>

        {/* STUDENT INFO */}
        <div className="student-info">
          <div><strong>NAME:</strong> {student.name}</div>
          <div><strong>CLASS:</strong> {classId} {section}</div>
          <div><strong>ROLL NO.:</strong> {student.examRollNo}</div>
        </div>

        {/* MARKS TABLE */}
        <table className="marks-table">
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>Internal<br />Wt.(20)</th>
              <th>Mid Term<br />Wt.(30)</th>
              <th>Final Term<br />Wt.(50)</th>
              <th>Total<br />(100)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subjects).map(([subject, m]) => {
              const total =
                (m.internals || 0) +
                (m.midTerm || 0) +
                (m.finalTerm || 0);

              // only render if marks exist
              if (!total) return null;

              return (
                <tr key={subject}>
                  <td>{subject.toUpperCase()}</td>
                  <td>{m.internals || 0}</td>
                  <td>{m.midTerm || 0}</td>
                  <td>{m.finalTerm || 0}</td>
                  <td>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* REMARKS BY SUBJECT */}
        <div className="remarks-section">
          <div className="remarks-title">
            REMARKS BY SUBJECT TEACHERS
          </div>

          <table className="remarks-table">
            {Object.entries(subjects).map(([subject, m]) => {
              if (!m.remark) return null;

              return (
                <tr key={subject}>
                  <td>{subject.toUpperCase()}</td>
                  <td>{m.remark}</td>
                </tr>
              );
            })}
          </table>
        </div>

        {/* ATTENDANCE */}
        {student.attendance && (
          <div className="attendance">
            <strong>ATTENDANCE:</strong> {student.attendance}
          </div>
        )}

        {/* CO-CURRICULAR */}
        {(student.activities || []).length > 0 && (
          <table className="remarks-table">
            {student.activities.map((a, i) => (
              <tr key={i}>
                <td>{a.name}</td>
                <td>{a.grade}</td>
              </tr>
            ))}
          </table>
        )}

        {/* FINAL REMARK */}
        <div className="general-remarks">
          <strong>REMARKS:</strong> {student.finalRemark || "—"}
        </div>

        <div className="general-remarks">
          <strong>Allowed to sit in class w.e.f:</strong>{" "}
          {student.allowedDate || "—"}
        </div>

        {/* FOOTER */}
        <div className="footer">
          <div className="footer-item">
            <div>CLASS TEACHER</div>
          </div>
          <div className="footer-item">
            <div>EXAM I/C</div>
          </div>
          <div className="footer-item">
            <div>DIRECTOR(ACAD)/HOS</div>
          </div>
        </div>

        <div className="note">
          Electronically generated signature not required
        </div>
      </div>
    );
  }
);

export default ReportCard;

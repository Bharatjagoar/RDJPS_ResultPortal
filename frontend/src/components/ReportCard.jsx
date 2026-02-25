import React, { forwardRef } from "react";
import "./ReportCard.css";

const ReportCard = forwardRef(
  ({ student, classId, section }, ref) => {

    const subjects = student?.subjects || {};

    const subjectEntries = Object.entries(subjects);

    const dynamicFields = Array.from(
      new Set(
        subjectEntries.flatMap(([_, marks]) =>
          Object.keys(marks).filter(key => key !== "total")
        )
      )
    );
    const isGradeBased =
      subjectEntries.length > 0 &&
      Object.keys(subjectEntries[0][1]).length === 1 &&
      subjectEntries[0][1].hasOwnProperty("grade");
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

              {isGradeBased ? (
                <th>GRADE</th>
              ) : (
                <>
                  {dynamicFields.map(field => (
                    <th key={field}>{field.toUpperCase()}</th>
                  ))}
                  <th>TOTAL</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {subjectEntries.map(([subject, marks]) => {

              // ⭐ GRADE BASED (Class 1–5)
              if (isGradeBased) {
                return (
                  <tr key={subject}>
                    <td>{subject.toUpperCase()}</td>
                    <td>{marks.grade || "-"}</td>
                  </tr>
                );
              }

              // ⭐ NUMERIC BASED (Class 9–12)
              const total = Object.entries(marks)
                .filter(([key]) => key !== "total")
                .reduce((sum, [, val]) => sum + (Number(val) || 0), 0);

              return (
                <tr key={subject}>
                  <td>{subject.toUpperCase()}</td>

                  {dynamicFields.map(field => (
                    <td key={field}>{marks[field] ?? ""}</td>
                  ))}

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
        {student.activities && Object.keys(student.activities).length > 0 && (
          <table className="remarks-table">
            {Object.entries(student.activities).map(([name, grade]) => (
              <tr key={name}>
                <td>{name.toUpperCase()}</td>
                <td>{grade}</td>
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

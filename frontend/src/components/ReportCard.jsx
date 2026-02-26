import React, { forwardRef } from "react";
import "./ReportCard.css";
import logo from "../assets/logo.jpeg";
import primaryBg from "../assets/background.png";
import { getAcademicSession, excelDateToJS } from "../pages/utils";

const ReportCard = forwardRef(
  ({ student, classId, section }, ref) => {
    console.log(student);
    console.log(student.dob)
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

    const classNumber = parseInt(student.class);
    const isPrimary = classNumber <= 5;
    const academicSession = getAcademicSession();
    return (
      <div ref={ref} className="container">
        <div className={`report-container ${isPrimary ? "primary-theme" : ""}`}>
          {/* HEADER */}
          <div className="report-header">
            <img src={logo} alt="School Logo" className="school-logo" />

            <div className="school-details">
              <h1 className="school-name">
                RUKMANI DEVI JAIPURIA PUBLIC SCHOOL
              </h1>

              <h2 className="school-address">
                23, Rajpur Road, Delhi-110054
                <span className="phone">Ph. 40314190</span>
              </h2>

              <p>An English Medium Sr. Sec. Co-Educational School</p>

              <p className="affiliation">
                Affiliated to CBSE
                <span>Affiliation No.: 2730100</span>
              </p>

              <p className="school-meta">
                School Id: 1207181
                <span>School No: 85054</span>
                <br></br>
                <span>E-mail: rdjps2010@gmail.com</span>
              </p>

              <div className="academic-title">
                Student's Academic Record {academicSession}
              </div>
            </div>
          </div>

          {/* STUDENT INFO */}
          <div className="student-info">
            <div className="info-grid">

              <div className="info-item">
                <span className="label">NAME:</span>
                <span className="value">{student.name}</span>
              </div>

              <div className="info-item">
                <span className="label">CLASS:</span>
                <span className="value">{classId} {section}</span>
              </div>

              <div className="info-item">
                <span className="label">ROLL NO.:</span>
                <span className="value">{student.examRollNo}</span>
              </div>

              <div className="info-item">
                <span className="label">ADMISSION NUMBER :</span>
                <span className="value">{student.admissionNo || "—"}</span>
              </div>

              <div className="info-item">
                <span className="label">FATHER'S NAME:</span>
                <span className="value">{student.fatherName || "—"}</span>
              </div>

              <div className="info-item">
                <span className="label">MOTHER'S NAME:</span>
                <span className="value">{student.motherName || "—"}</span>
              </div>

              <div className="info-item">
                <span className="label">HOUSE:</span>
                <span className="value">{student.house || "—"}</span>
              </div>

            </div>
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
          <div className="final-remark-section">
            <div className="remark-title">REMARKS :- </div>
            <div className="remark-box">
              {student.finalRemark && student.finalRemark.trim() !== ""
                ? student.finalRemark
                : "—"}
            </div>
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
      </div>
    );
  }
);

export default ReportCard;

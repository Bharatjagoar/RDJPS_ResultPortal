import React, { forwardRef } from "react";

const VerificationSheet = forwardRef(({ students, classId, section }, ref) => {

  if (!students || students.length === 0) return null;

  const subjects = Object.keys(students[0].subjects || {});

  return (
    <div ref={ref} style={{ padding: "20px", fontFamily: "Arial" }}>

      <h2 style={{ textAlign: "center" }}>
        Class {classId} {section} - Marks Verification Sheet
      </h2>

      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>

        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>

            {subjects.map((sub) => (
              <th key={sub}>{sub}</th>
            ))}

            <th>Attendance</th>
            <th>Remark</th>
            <th>Signature</th>
          </tr>
        </thead>

        <tbody>

          {students.map((student) => (

            <tr key={student._id}>

              <td>{student.examRollNo}</td>
              <td>{student.name}</td>

              {subjects.map((sub) => {

                const subject = student.subjects[sub];

                if (!subject) return <td key={sub}></td>;

                if (subject.TOTAL !== undefined) {
                  return <td key={sub}>{subject.TOTAL}</td>;
                }

                if (subject.grade) {
                  return <td key={sub}>{subject.grade}</td>;
                }

                return <td key={sub}></td>;
              })}

              <td>{student.attendance || "-"}</td>
              <td>{student.finalRemark}</td>
              <td></td>

            </tr>

          ))}

        </tbody>

      </table>

      <br />

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
        <div>Class Teacher Signature</div>
        <div>Admin Signature</div>
      </div>

    </div>
  );
});

export default VerificationSheet;
import React, { useState, useEffect } from "react";
import "./StudentEditModal.css";
import { toast } from "react-toastify";
import { calculateGrade } from "../pages/utils";
import { extractClassAndSection } from "../pages/utils";

const StudentEditModal = ({ isOpen, onClose, student, onSave, isverified }) => {
  console.log(student);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});
  console.log("here ", student)
  useEffect(() => {
    if (isOpen && student) {
      setEditData(JSON.parse(JSON.stringify(student)));
      setErrors({});
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  // ✅ ADD THIS BLOCK HERE
  const subjectEntries = Object.entries(editData.subjects || {});

  const dynamicFields = Array.from(
    new Set(
      subjectEntries.flatMap(([_, marks]) =>
        Object.keys(marks).filter(key => key !== "total")
      )
    )
  );
  const teacherData = JSON.parse(localStorage.getItem("user"));
  const teacherClass = teacherData?.classTeacherOf;
  const studentClass = extractClassAndSection(student?.class);
  const isSameClassTeacher =
    studentClass.className === teacherClass?.className &&
    studentClass.section === teacherClass?.section;


  // Validation function
  const validateMarks = (subject, field, value) => {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return "Must be a number";
    }

    if (num < 0) {
      return "Cannot be negative";
    }

    // const limits = {
    //   internals: 20,
    //   midTerm: 30,
    //   finalTerm: 50,
    //   total: 100
    // };

    // if (num > limits[field]) {
    //   return `Cannot exceed ${limits[field]}`;
    // }

    return null;
  };

  const handleSubjectChange = (subject, field, value) => {
    const error = validateMarks(subject, field, value);

    setErrors(prev => ({
      ...prev,
      [`${subject}-${field}`]: error
    }));

    setEditData(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: {
          ...prev.subjects[subject],
          [field]: value === "" ? "" : Number(value)
        }
      }
    }));
  };

  const calculateTotal = (subject) => {
    const marks = editData.subjects?.[subject] || {};

    return Object.entries(marks)
      .filter(([key]) => key !== "total")
      .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
  };

  const hasErrors = () => {
    return Object.values(errors).some(err => err !== null);
  };

  const handleSave = () => {
    if (hasErrors()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    // Auto-calculate totals before saving
    const updatedSubjects = { ...editData.subjects };
    Object.keys(updatedSubjects).forEach(subject => {
      updatedSubjects[subject].total = calculateTotal(subject);
    });

    const updatedData = {
      ...editData,
      subjects: updatedSubjects
    };

    onSave(updatedData);
  };

  return (
    <div className="student-modal-overlay">
      {/* <h1>fds</h1> */}
      <div className="student-modal-box">
        <div className="modal-header">
          <h2>Edit Student: {student.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="modal-content">
          {/* Student Basic Info */}
          <div className="student-info-card">
            <div className="info-row">
              <span className="info-label">Roll No:</span>
              <span className="info-value">{student.examRollNo}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Class:</span>
              <span className="info-value">{student.class}</span>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="subjects-section">
            <h3>Subject-wise Marks</h3>
            <table className="edit-table">
              <thead>
                <tr>
                  <th>Subject</th>

                  {dynamicFields.map(field => (
                    <th key={field}>{field.toUpperCase()}</th>
                  ))}

                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectEntries.map(([subject, marks]) => (
                  <tr key={subject}>
                    <td className="subject-name">{subject}</td>

                    {dynamicFields.map(field => {
                      const fieldExists = marks.hasOwnProperty(field);

                      return (
                        <td key={field}>
                          <input
                            type="number"
                            value={fieldExists ? marks[field] ?? "" : ""}
                            onChange={(e) =>
                              handleSubjectChange(subject, field, e.target.value)
                            }
                            disabled={!fieldExists}
                            className={`mark-input ${!fieldExists ? "disabled-input" : ""
                              } ${errors[`${subject}-${field}`] ? "input-error" : ""
                              }`}
                          />
                        </td>
                      );
                    })}

                    <td className="total-cell">
                      <strong>{calculateTotal(subject)}</strong>
                    </td>

                    <td className="grade-cell">
                      <strong>{calculateGrade(calculateTotal(subject))}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="cancel-modal-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-modal-btn"
            onClick={handleSave}
            disabled={
              isverified ||
              hasErrors() ||
              !isSameClassTeacher
            }
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
};

export default StudentEditModal;
import React, { useState, useEffect } from "react";
import "./StudentEditModal.css";
import { toast } from "react-toastify";
import { calculateGrade } from "../pages/utils";
import { extractClassAndSection } from "../pages/utils";

const StudentEditModal = ({ isOpen, onClose, student, onSave, isverified }) => {
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

    const limits = {
      internals: 20,
      midTerm: 30,
      finalTerm: 50,
      total: 100
    };

    if (num > limits[field]) {
      return `Cannot exceed ${limits[field]}`;
    }

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
    const marks = editData.subjects[subject];
    return (marks.internals || 0) + (marks.midTerm || 0) + (marks.finalTerm || 0);
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
                  <th>Internals (20)</th>
                  <th>Mid-Term (30)</th>
                  <th>Final (50)</th>
                  <th>Total (100)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(editData.subjects || {}).map(([subject, marks]) => (
                  <tr key={subject}>
                    <td className="subject-name">{subject}</td>

                    {/* Internals */}
                    <td>
                      <input
                        type="number"
                        className={`mark-input ${errors[`${subject}-internals`] ? 'input-error' : ''}`}
                        value={marks.internals}
                        onChange={(e) => handleSubjectChange(subject, "internals", e.target.value)}
                        min="0"
                        max="20"
                      />
                      {errors[`${subject}-internals`] && (
                        <span className="error-text">{errors[`${subject}-internals`]}</span>
                      )}
                    </td>

                    {/* Mid-Term */}
                    <td>
                      <input
                        type="number"
                        className={`mark-input ${errors[`${subject}-midTerm`] ? 'input-error' : ''}`}
                        value={marks.midTerm}
                        onChange={(e) => handleSubjectChange(subject, "midTerm", e.target.value)}
                        min="0"
                        max="30"
                      />
                      {errors[`${subject}-midTerm`] && (
                        <span className="error-text">{errors[`${subject}-midTerm`]}</span>
                      )}
                    </td>

                    {/* Final */}
                    <td>
                      <input
                        type="number"
                        className={`mark-input ${errors[`${subject}-finalTerm`] ? 'input-error' : ''}`}
                        value={marks.finalTerm}
                        onChange={(e) => handleSubjectChange(subject, "finalTerm", e.target.value)}
                        min="0"
                        max="50"
                      />
                      {errors[`${subject}-finalTerm`] && (
                        <span className="error-text">{errors[`${subject}-finalTerm`]}</span>
                      )}
                    </td>

                    {/* Total (Auto-calculated) */}
                    <td className="total-cell">
                      <strong>{calculateTotal(subject)}</strong>
                    </td>

                    {/* Grade */}
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
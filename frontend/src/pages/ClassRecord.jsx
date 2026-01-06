import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar"
import StudentEditModal from "../components/StudentEditModal.jsx";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { generateReportCard } from "../utils/generateReportCard.jsx";
import ReportCard from "../components/ReportCard";
import html2pdf from "html2pdf.js";
import { useRef } from "react";


import { calculateGrandTotalAndMax, calculateGrade, calculateResultFromSubjects } from "./utils.js";

import "./ClassRecordsPage.css";


function extractClassAndSection(input) {
  if (!input || typeof input !== "string") {
    return { className: null, section: null };
  }

  const normalized = input
    .replace(/\s+/g, " ")
    .trim();

  /**
   * Supported patterns:
   * "9 Science"
   * "Class 9 Science"
   * "Class 9 - Science"
   * "Class 9 Section Science"
   * "9-Science"
   * "11 PCM"
   */

  const match = normalized.match(
    /(?:class\s*)?(\d{1,2})\s*(?:-|section\s*)?\s*(.+)/i
  );

  if (!match) {
    return { className: null, section: null };
  }

  const className = match[1];
  const section = match[2]?.trim();

  if (!section) {
    return { className, section: null };
  }

  return {
    className,
    section
  };
}



const verifyMarks = async (classId, section, setIsVerified) => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    await axios.put(
      "http://localhost:5000/api/class-verification/verify",
      {
        className: classId,
        section
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setIsVerified(true);

    toast.success(`Marks finalized for Class ${classId} ${section}`);
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Failed to verify marks"
    );
  }
};




const ClassRecordsPage = () => {
  const { classId } = useParams();
  const reportRef = useRef();
  console.log(classId);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [section, setSection] = useState("");
  const [hasSelectedSection, setHasSelectedSection] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [existingsections, setexistingSection] = useState([]);
  const [isVerified, setIsVerified] = useState(false);


  const user = JSON.parse(localStorage.getItem("user"));

  const isClassTeacher =
    user?.classTeacherOf &&
    user.classTeacherOf.className === classId &&
    user.classTeacherOf.section === section;

  // =========================
  // FETCH STUDENTS
  // =========================
  const fetchStudents = async (fullClassName) => {
    try {
      setLoading(true);

      const encodedClass = encodeURIComponent(fullClassName);

      const res = await axios.get(
        `http://localhost:5000/api/students/class/${encodedClass}`
      );

      setStudents(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("hellow bharat");
    async function getsections() {
      console.log(classId);
      const { className, section } = extractClassAndSection(classId);
      try {
        const getsection = await axios.get("http://localhost:5000/api/students/section/" + classId);
        console.log(getsection.data.data);
        setexistingSection(getsection?.data?.data);
      } catch (error) {
        console.log(error)
      }
    }
    getsections();
  }, [])

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const res = await axios.get(
          "http://localhost:5000/api/class-verification/status",
          {
            params: { className: classId, section },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.data.length > 0 && res.data.data[0].isVerified) {
          setIsVerified(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchVerificationStatus();
  }, [classId, section]);


  // =========================
  // EDIT HANDLERS
  // =========================
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSave = async (updatedStudent) => {
    try {
      const payload = {
        subjects: updatedStudent.subjects,
        grandTotal: updatedStudent.grandTotal,
        result: updatedStudent.result,
        overallGrade: updatedStudent.overallGrade,
      };

      const token = localStorage.getItem("authToken");

      await axios.put(
        `http://localhost:5000/api/students/${updatedStudent._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      toast.success("Student updated successfully");
      closeModal();

      const fullClassName = `${classId} ${section}`;
      fetchStudents(fullClassName);
    } catch (err) {
      console.log("err", err);
      toast.error("Update failed");
    }
  };

  // =========================
  // SECTION SELECTION UI
  // =========================
  if (!hasSelectedSection) {
    return (
      <>
        <Navbar />


        <div className="records-container empty-state">
          <h1 className="records-title">
            Class {classId} — Select Section
          </h1>


          <div className="empty-card">
            <h2>Select Section</h2>
            <p>Please choose a section to load student records.</p>

            <select
              className="section-dropdown"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="">-- Select Section --</option>
              {
                existingsections?.map((item, index) => {
                  return <option key={index} value={item}>{item}</option>
                })
              }
            </select>

            <button
              className="primary-btn"
              disabled={!section}
              onClick={() => {
                const fullClassName = `${classId} ${section.toUpperCase()}`;
                setHasSelectedSection(true);
                fetchStudents(fullClassName);
              }}
            >
              Load Records
            </button>
          </div>
        </div>
      </>
    );
  }

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <>
        <Navbar />
        <Loader text="Fetching student records..." />
      </>
    );
  }


  // =========================
  // EMPTY DATA STATE
  // =========================
  if (!loading && students.length === 0) {
    return (
      <>
        <Navbar />
        <div className="records-container empty-state">
          <h1 className="records-title">
            Class {classId} {section} — Student Records
          </h1>

          <div className="empty-card">
            <h2>No student data found</h2>
            <p>
              No students or marks have been uploaded for this class section yet.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                (window.location.href = `/class/${classId}/excel`)
              }
            >
              Upload Marks via Excel
            </button>
          </div>
        </div>
      </>
    );
  }
  const downloadReport = (student) => {
    console.log(student, reportRef);
    if (!student || !reportRef.current) return;

    html2pdf()
      .set({
        margin: 0,
        filename: `${student.name}_Report_Card.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"]
        }
      })

      .from(reportRef.current)
      .save();
  };


  // =========================
  // MAIN TABLE UI
  // =========================
  return (
    <>
      <Navbar />
      <div className="records-container">
        <h1 className="records-title">
          Class {classId} {section} — Student Records
        </h1>

        {isClassTeacher && (
          <div className="records-action-bar">
            <button
              disabled={isVerified}
              className="primary-btn"
              onClick={() => verifyMarks(classId, section, setIsVerified)}
            >
              {isVerified ? "✅ Marks Finalized" : "✅ Verify / Finalize Marks"}
            </button>

          </div>
        )}

        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Grand Total</th>
                <th>Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const { grandTotal, maxTotal } =
                  calculateGrandTotalAndMax(student.subjects);

                const result =
                  grandTotal === 0
                    ? "N/A"
                    : calculateResultFromSubjects(student.subjects);

                return (
                  <tr key={student._id}>
                    <td>{student.examRollNo}</td>
                    <td>{student.name}</td>
                    <td>{student.fatherName}</td>

                    {/* GRAND TOTAL */}
                    <td className="grand-total-cell">
                      <strong>
                        {grandTotal > 0 ? `${grandTotal} / ${maxTotal}` : "N/A"}
                      </strong>
                    </td>

                    {/* RESULT */}
                    <td>
                      <span className={`result-badge ${result.toLowerCase()}`}>
                        {result}
                      </span>
                    </td>

                    <td className="action-cell">
                      <button
                        className="view-edit-btn"
                        onClick={() => openEditModal(student)}
                      >
                        View/Edit
                      </button>

                      <button
                        className="download-btn"
                        onClick={() => {
                          setSelectedStudent(student);
                          requestAnimationFrame(() => downloadReport(student));
                        }}

                      >
                        Download Report
                      </button>
                    </td>


                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <StudentEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        student={selectedStudent}
        onSave={handleSave}
        isverified={isVerified}
      />
      {selectedStudent && (
        <div style={{ position: "absolute", left: "-9999px" }}>
          <ReportCard
            ref={reportRef}
            student={selectedStudent}
            classId={classId}
            section={section}
          />
        </div>
      )}

    </>
  );
};

export default ClassRecordsPage;
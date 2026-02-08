import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./ExcelUploadPage.css";
import StudentDetailsModal from "./StudentDetailsModal";
import { useParams } from "react-router-dom";
import axios from "axios";
import { api } from "./utils";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
// import { transformDataForBackend } from "./utils";
import { useNavigate } from "react-router-dom";
import { extractClassAndSection } from "./utils";


const formatDateDDMMYYYY = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};



const excelDateToJS = (serialOrVal) => {
  if (serialOrVal === null || serialOrVal === undefined || serialOrVal === "") {
    return "";
  }

  // 1️⃣ Already a Date object
  if (serialOrVal instanceof Date && !isNaN(serialOrVal)) {
    return formatDateDDMMYYYY(serialOrVal);
  }

  // 2️⃣ Excel serial number
  const maybeNum =
    typeof serialOrVal === "number" ? serialOrVal : parseFloat(serialOrVal);

  if (!isNaN(maybeNum)) {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + Math.round(maybeNum) * 86400000);
    if (!isNaN(jsDate)) {
      return formatDateDDMMYYYY(jsDate);
    }
  }

  // 3️⃣ Parse string dates
  const parsed = new Date(serialOrVal);
  if (!isNaN(parsed)) {
    return formatDateDDMMYYYY(parsed);
  }

  // 4️⃣ Fallback
  return String(serialOrVal);
};

const ExcelUploadPage = () => {
  const { classId } = useParams();
  const [excelData, setExcelData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [fullRawData, setFullRawData] = useState([]);
  const [allMainHeaders, setAllMainHeaders] = useState([]);
  const [allSubHeaders, setAllSubHeaders] = useState([]);
  const [filteredIndices, setFilteredIndices] = useState([]); // ⭐ Store filtered indices
  const nav = useNavigate();



  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      // ========== FIX MAIN HEADERS HERE ==========
      let last = "";
      const mainHeadersRaw = sheet[0];
      const mainHeaders = mainHeadersRaw.map((val) => {
        if (val !== null && val !== undefined && val !== "") {
          last = val;
          return val;
        }
        return last;
      });
      const subHeaders = sheet[1];
      const rawRows = sheet.slice(2);

      console.log("Main Headers (Row 0):", mainHeaders);
      console.log("Sub Headers (Row 1):", subHeaders);

      setAllMainHeaders(mainHeaders);
      setAllSubHeaders(subHeaders);
      setFullRawData(rawRows);

      const filteredHeaders = [];
      const indices = [];

      // First 8 columns: basic info
      const basicInfoHeaders = [
        "Student's Name",
        "Father's Name",
        "Mother's Name",
        "Exam Roll No.",
        "Class",
        "D.O.B",
        "Admission No.",
        "House"
      ];

      basicInfoHeaders.forEach((h, i) => {
        filteredHeaders.push(h);
        indices.push(i);
      });

      // -------- SUBJECT LOGIC --------
      let lastSubject = null;

      for (let i = 8; i < mainHeaders.length; i++) {
        const main = mainHeaders[i]?.toString().trim();
        const sub = allSubHeaders[i]?.toString().toLowerCase().trim();

        // Detect new subject ONLY when main header changes
        if (main && main !== lastSubject) {
          lastSubject = main;
        }

        // Show only TOTAL columns in preview
        if (sub?.includes("total")) {
          filteredHeaders.push(`${lastSubject} Total`);
          indices.push(i);
        }

        // Non-subject columns (Grade / Attendance / Arts / Sports)
        if (
          main?.toLowerCase() === "grade" ||
          main?.toLowerCase() === "attendance" ||
          sub?.includes("arts") ||
          sub?.includes("sports")
        ) {
          filteredHeaders.push(main || sub);
          indices.push(i);
        }
      }

      console.log("✅ Filtered Headers:", filteredHeaders);
      console.log("✅ Filtered Indices:", indices);

      setFilteredIndices(indices);

      const formatted = rawRows.map((row) => {
        const obj = {};
        filteredHeaders.forEach((header, i) => {
          const originalIndex = indices[i];
          obj[header] = row[originalIndex] || "";
        });
        return obj;
      });

      setTableHeaders(filteredHeaders);
      setExcelData(formatted);
      console.log("✅ Formatted Data:", formatted);
    };

    reader.readAsBinaryString(file);
  };

  const handleEdit = (rowIndex, colName, newValue) => {
    const updated = [...excelData];
    updated[rowIndex][colName] = newValue;
    setExcelData(updated);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // ⭐ Add this function to your component
  const transformDataForBackend = () => {
    console.log("🔍 Debugging Headers:");
    console.log("Main Headers:", allMainHeaders);
    console.log("Sub Headers:", allSubHeaders);
    console.log("First Row Sample:", fullRawData[0]);

    // ⭐ STEP 1: Detect subjects dynamically
    const subjects = [];
    let currentSubject = null;

    for (let i = 8; i < allMainHeaders.length; i++) {
      const mainHeader = allMainHeaders[i] ? allMainHeaders[i].toString().trim() : "";
      const subHeader = allSubHeaders[i] ? allSubHeaders[i].toString().trim().toLowerCase() : "";

      // Skip GRADE and Attendance columns
      if (mainHeader.toLowerCase() === "grade" || mainHeader.toLowerCase() === "attendance") {
        break;
      }

      // New subject detected
      if (mainHeader && mainHeader !== "") {
        currentSubject = {
          name: mainHeader,
          internalsIndex: i,
          midTermIndex: i + 1,
          finalTermIndex: i + 2,
          totalIndex: i + 3,
          gradeIndex: i + 4
        };
        subjects.push(currentSubject);
      }
    }

    console.log("📚 Detected Subjects:", subjects);

    // ⭐ STEP 2: Find GRADE, Arts/Sports, and Attendance columns
    let gradeColumnIndex = -1;
    let resultColumnIndex = -1;
    let attendanceColumnIndex = -1;

    for (let i = 0; i < allMainHeaders.length; i++) {
      const mainHeader = allMainHeaders[i] ? allMainHeaders[i].toString().trim().toLowerCase() : "";
      const subHeader = allSubHeaders[i] ? allSubHeaders[i].toString().trim().toLowerCase() : "";

      if (mainHeader === "grade") {
        gradeColumnIndex = i;
      }
      if (subHeader.includes("arts") || subHeader.includes("sports")) {
        resultColumnIndex = i;
      }
      if (mainHeader === "attendance" || subHeader.includes("attendance")) {
        attendanceColumnIndex = i;
      }
    }

    console.log(`📍 Column Indices - Grade: ${gradeColumnIndex}, Result: ${resultColumnIndex}, Attendance: ${attendanceColumnIndex}`);

    // ⭐ STEP 3: Transform each row
    const transformedData = fullRawData.map((row, rowIdx) => {
      const studentData = {
        name: row[0] || "",
        fatherName: row[1] || "",
        motherName: row[2] || "",
        examRollNo: row[3] || "",
        class: row[4] || "",
        dob: excelDateToJS(row[5]) || "",
        admissionNo: row[6] || "",
        house: row[7] || "",
        subjects: {},
        overallGrade: gradeColumnIndex >= 0 ? (row[gradeColumnIndex] || "") : "",
        result: resultColumnIndex >= 0 ? (row[resultColumnIndex] || "") : "",
        grandTotal: attendanceColumnIndex >= 0 ? (parseFloat(row[attendanceColumnIndex]) || 0) : 0
      };

      // Parse each subject
      subjects.forEach((subject) => {
        const internals = parseFloat(row[subject.internalsIndex]) || 0;
        const midTerm = parseFloat(row[subject.midTermIndex]) || 0;
        const finalTerm = parseFloat(row[subject.finalTermIndex]) || 0;
        const total = parseFloat(row[subject.totalIndex]) || 0;
        const grade = row[subject.gradeIndex] || "";

        studentData.subjects[subject.name] = {
          internals,
          midTerm,
          finalTerm,
          total,
          grade
        };
      });

      return studentData;
    });

    return transformedData;
  };

  // ⭐ Update your handleSubmit function
  const handleSubmit = async () => {
    const transformedData = transformDataForBackend();
    // ===============================
    // 🔍 DETECT CLASS & SECTION FROM EXCEL
    // ===============================

    if (!fullRawData.length) {
      toast.error("Excel file is empty");
      return;
    }

    // Class column = index 4
    const rawClassValue = fullRawData[0][4];
    const { className: excelClass, section: excelSection } = extractClassAndSection(rawClassValue);

    if (!excelClass || !excelSection) {
      toast.error("Unable to detect class and section from Excel");
      return;
    }

    console.log(excelClass, excelSection);
    // ===============================
    // 🔐 CLASS TEACHER AUTHORIZATION
    // ===============================

    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.classTeacherOf) {
      const allowedClass = user.classTeacherOf.className;
      const allowedSection = user.classTeacherOf.section;

      if (
        excelClass !== allowedClass ||
        excelSection !== allowedSection
      ) {
        toast.error(
          `Access denied: You are class teacher of ${allowedClass}-${allowedSection} only`
        );
        return; // ❌ STOP — no backend call
      }
    }


    console.log("📄 TRANSFORMED DATA FOR BACKEND:", JSON.stringify(transformedData, null, 2));

    // ⭐ VALIDATION BEFORE SENDING
    const validation = validateAllStudents(transformedData);

    if (!validation.isValid) {
      console.error("❌ VALIDATION FAILED:", validation.errors);

      // Show error to user
      alert(
        `⚠️ Validation Failed!\n\n` +
        `Found ${validation.errors.length} error(s):\n\n` +
        validation.errors.slice(0, 10).join("\n") +
        (validation.errors.length > 10
          ? `\n\n...and ${validation.errors.length - 10} more errors`
          : "")
      );

      return; // Don't proceed with API call
    }

    console.log("✅ VALIDATION PASSED!");
    console.log(transformedData);
    // ⭐ Now send to backend with Axios
    try {
      const token = localStorage.getItem("authToken");

      const response = await api.post(
        "http://localhost:5000/api/students/bulk",
        {
          classId: classId,
          students: transformedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      // Axios automatically parses JSON
      const result = response.data;

      // alert(`✅ Success! ${result.count} students uploaded successfully!`);
      toast.success(`✅ ${result.inserted || result.updated} students uploaded successfully!`);
      console.log("✅ UPLOAD SUCCESS:", result);
      nav(-1);
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        alert(`❌ Upload Failed: ${error.response.data.message || "Unknown error"}`);
        console.error("❌ UPLOAD ERROR:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        alert("❌ Network Error: No response from server");
        console.error("❌ NETWORK ERROR:", error.request);
      } else {
        // Something else happened
        alert(`❌ Error: ${error.message}`);
        console.error("❌ ERROR:", error.message);
      }
    }
  };


  const validateMarks = (value, max, fieldName) => {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a number` };
    }

    if (num < 0) {
      return { valid: false, error: `${fieldName} cannot be negative` };
    }

    if (num > max) {
      return { valid: false, error: `${fieldName} cannot exceed ${max}` };
    }

    return { valid: true, value: num };
  };

  const validateSubject = (subjectName, subjectData) => {
    const errors = [];

    const internalsValidation = validateMarks(subjectData.internals, 20, `${subjectName} - Internals`);
    if (!internalsValidation.valid) errors.push(internalsValidation.error);

    const midTermValidation = validateMarks(subjectData.midTerm, 30, `${subjectName} - Mid Term`);
    if (!midTermValidation.valid) errors.push(midTermValidation.error);

    const finalTermValidation = validateMarks(subjectData.finalTerm, 50, `${subjectName} - Final Term`);
    if (!finalTermValidation.valid) errors.push(finalTermValidation.error);

    const totalValidation = validateMarks(subjectData.total, 100, `${subjectName} - Total`);
    if (!totalValidation.valid) errors.push(totalValidation.error);

    if (internalsValidation.valid && midTermValidation.valid && finalTermValidation.valid && totalValidation.valid) {
      const calculatedTotal = internalsValidation.value + midTermValidation.value + finalTermValidation.value;
      if (Math.abs(calculatedTotal - totalValidation.value) > 0.01) {
        errors.push(`${subjectName} - Total (${totalValidation.value}) doesn't match sum (${calculatedTotal})`);
      }
    }

    // const validGrades = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E', 'E1'];
    // if (!validGrades.includes(subjectData.grade)) {
    //   errors.push(`${subjectName} - Invalid grade: ${subjectData.grade}`);
    // }

    return errors;
  };

  const validateStudent = (student, rowIndex) => {
    const errors = [];
    const studentIdentifier = `Row ${rowIndex + 1} (${student.name || 'Unknown'})`;

    if (!student.name || student.name.trim() === '') {
      errors.push(`${studentIdentifier} - Name is required`);
    }

    if (!student.examRollNo || isNaN(student.examRollNo)) {
      errors.push(`${studentIdentifier} - Valid exam roll number is required`);
    }

    if (!student.admissionNo || isNaN(student.admissionNo)) {
      errors.push(`${studentIdentifier} - Valid admission number is required`);
    }

    const validHouses = ['Vallabhi', 'Pushpagiri', 'Takshshila', 'Nalanda'];
    if (student.house && !validHouses.includes(student.house)) {
      errors.push(`${studentIdentifier} - Invalid house: ${student.house}`);
    }

    if (!student.subjects || Object.keys(student.subjects).length === 0) {
      errors.push(`${studentIdentifier} - At least one subject is required`);
    } else {
      for (const [subjectName, subjectData] of Object.entries(student.subjects)) {
        const subjectErrors = validateSubject(subjectName, subjectData);
        errors.push(...subjectErrors.map(err => `${studentIdentifier} - ${err}`));
      }
    }

    return errors;
  };

  const validateAllStudents = (students) => {
    const allErrors = [];
    const rollNoMap = new Map();
    const admissionNoMap = new Map();

    students.forEach((student, index) => {
      const studentErrors = validateStudent(student, index);
      allErrors.push(...studentErrors);

      if (student.examRollNo) {
        if (rollNoMap.has(student.examRollNo)) {
          allErrors.push(`Duplicate Exam Roll No: ${student.examRollNo} at rows ${rollNoMap.get(student.examRollNo) + 1} and ${index + 1}`);
        } else {
          rollNoMap.set(student.examRollNo, index);
        }
      }

      if (student.admissionNo) {
        if (admissionNoMap.has(student.admissionNo)) {
          allErrors.push(`Duplicate Admission No: ${student.admissionNo} at rows ${admissionNoMap.get(student.admissionNo) + 1} and ${index + 1}`);
        } else {
          admissionNoMap.set(student.admissionNo, index);
        }
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      totalStudents: students.length
    };
  };


  return (
    <>
      <Navbar />
      <div className="excel-container">
        <h1 className="excel-title">Upload Excel – Class {classId}</h1>

        <div className="upload-box">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </div>

        {excelData.length > 0 && (
          <>
            <div className="header-controls">
              <h2 className="preview-title">Preview & Edit Data</h2>
              {/* <button className="edit-toggle-btn" onClick={toggleEditMode}>
              {editMode ? "🔒 Lock Table" : "✏️ Enable Editing"}
            </button> */}
            </div>

            <div className="table-container">
              <table className="excel-table">
                <thead>
                  <tr>
                    {tableHeaders.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                    <th>Marks Summary</th>
                  </tr>
                </thead>

                <tbody>
                  {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableHeaders.map((col, colIndex) => {
                        let date;
                        if (col === "D.O.B") {
                          date = excelDateToJS(row[col]);
                        } else {
                          date = row[col];
                        }
                        return (<td key={colIndex}>
                          <input
                            value={date}
                            onChange={(e) => handleEdit(rowIndex, col, e.target.value)}
                            disabled={!editMode}
                            className={"locked"}
                          />
                        </td>)
                      })}

                      <td>
                        <button
                          className="details-btn"
                          onClick={() => {
                            setSelectedStudent(fullRawData[rowIndex]);
                            setSelectedStudentIndex(rowIndex);
                            setModalOpen(true);
                          }}
                        >
                          📄 Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <StudentDetailsModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              student={selectedStudent}
              mainHeaders={allMainHeaders}
              subHeaders={allSubHeaders}
            />

            <button className="submit-btn" onClick={handleSubmit}>Submit Data</button>
          </>
        )}
      </div>
    </>
  );
};

export default ExcelUploadPage;
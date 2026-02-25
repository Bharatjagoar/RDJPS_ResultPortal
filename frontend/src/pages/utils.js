const OTP_STORAGE_KEY = "OTP_STORAGE_KEY";
import axios from "axios";





const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// ⭐ Add this function to your component
const transformDataForBackend = () => {
  console.log("🔍 Debugging Headers:");
  console.log("Main Headers:", allMainHeaders);
  console.log("Sub Headers:", allSubHeaders);
  console.log("First Row Sample:", fullRawData[0]);

  // ⭐ STEP 1: Detect subjects dynamically
  const subjects = [];
  let currentSubject = null;


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


export const saveOTPState = (email, expiryTime) => {
  const state = {
    email,
    expiryTime, // timestamp in milliseconds
  };
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(state));
};

export const getOTPState = () => {
  const stored = localStorage.getItem(OTP_STORAGE_KEY);
  if (!stored) return null;

  try {
    const state = JSON.parse(stored);
    const now = Date.now();

    // Check if OTP has expired
    if (state.expiryTime < now) {
      clearOTPState();
      return null;
    }

    return {
      email: state.email,
      timeLeft: Math.floor((state.expiryTime - now) / 1000),
    };
  } catch {
    clearOTPState();
    return null;
  }
};

export const clearOTPState = async () => {
  try {
    const stored = localStorage.getItem(OTP_STORAGE_KEY);

    if (!stored) return;

    const { email } = JSON.parse(stored);

    if (email) {
      await api.post("/auth/cancel", { email });
    }

    localStorage.removeItem(OTP_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to cancel signup:", err);
    localStorage.removeItem(OTP_STORAGE_KEY); // still clean UI
  }
};

// Check if user is already verified
export const checkUserVerified = async () => {
  try {
    const token = localStorage.getItem('authToken'); // Adjust based on your auth implementation
    if (!token) return false;

    // Make API call to check if user is verified
    const response = await api.get('/auth/check-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.data;
    return data.isVerified;
  } catch {
    return false;
  }
};

const calculateGrade = (total) => {
  if (total >= 91 && total <= 100) return "A1";
  if (total >= 81) return "A2";
  if (total >= 71) return "B1";
  if (total >= 61) return "B2";
  if (total >= 51) return "C1";
  if (total >= 41) return "C2";
  if (total >= 33) return "D";
  if (total >= 21) return "E1";
  if (total >= 1) return "E2";
  return "";
};

const calculateSubjectTotal = (marks = {}) => {
  if (!marks) return 0;

  return Object.entries(marks)
    .filter(([key]) => key !== "total") // ignore stored total
    .reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
};

const calculateGrandTotalAndMax = (subjects = {}) => {
  let grandTotal = 0;
  let maxTotal = 0;

  Object.values(subjects).forEach((marks) => {
    const subjectTotal = calculateSubjectTotal(marks);

    if (subjectTotal > 0) {
      grandTotal += subjectTotal;
      maxTotal += subjectTotal; // dynamic max based on actual components
    }
  });

  return {
    grandTotal,
    maxTotal
  };
};

const calculateResultFromSubjects = (subjects = {}) => {
  // FAIL if any subject total < 33
  for (const marks of Object.values(subjects)) {
    const total = calculateSubjectTotal(marks);
    if (total > 0 && total < 33) {
      return "FAIL";
    }
  }
  return "PASS";
};


const extractClassAndSection = (rawValue) => {
  if (!rawValue) return { className: null, section: null };

  const normalized = rawValue
    .toString()
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  // Handles: "9-A", "9 A", "9A"
  const match = normalized.match(/^(\d{1,2})\s*-?\s*([A-Z])$/);

  if (!match) return { className: null, section: null };

  return {
    className: match[1],
    section: match[2]
  };
};


const normalize = (text = "") =>
  text
    .toLowerCase()
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();


const detectKey = (sub) => {
  if (sub.includes("ut")) return "ut";
  if (sub.includes("mid")) return "mid";
  if (sub.includes("final")) return "final";
  if (sub.includes("project")) return "project";
  if (sub.includes("internal")) return "internal";
  if (sub.includes("practical")) return "practical";
  if (sub.includes("total")) return "total";
  return null;
};



const buildSubjectMap = (mainHeaders, subHeaders) => {
  const subjectMap = {};
  let currentSubject = null;

  for (let i = 8; i < subHeaders.length; i++) {
    const main = (mainHeaders[i] || "").trim();
    const sub = normalize(subHeaders[i]);

    // stop when academic subjects end
    if (main.toLowerCase() === "attendance") break;

    // new subject block starts
    if (main && main !== currentSubject) {
      currentSubject = main;
      subjectMap[currentSubject] = [];
    }

    if (!currentSubject) continue;

    const key = detectKey(sub);
    if (!key) continue;

    subjectMap[currentSubject].push({
      key,
      index: i
    });
  }

  return subjectMap;
};

const hasAnyMarks = (subjectData) => {
  return Object.entries(subjectData).some(
    ([key, value]) =>
      key !== "subject" && Number(value) > 0
  );
};


const buildColumnSchema = (subjectMap) => {
  const orderedKeys = [];
  const seen = new Set();

  Object.values(subjectMap).forEach(fields => {
    fields.forEach(({ key }) => {
      if (!seen.has(key)) {
        seen.add(key);
        orderedKeys.push(key);
      }
    });
  });

  return orderedKeys;
};


const formatHeaderLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

export const orderColumnKeys = (keys) => {
  const priority = [
    "ut",
    "internal",
    "mid",
    "final",
    "project",
    "practical",
    "total"
  ];

  return [
    ...priority.filter(p => keys.includes(p)),
    ...keys.filter(k => !priority.includes(k))
  ];
};

const validateSubject = (subjectName, subjectData) => {
  const errors = [];

  const maxByKey = {
    ut: 20,
    internals: 20,
    mid: 30,
    midTerm: 30,
    final: 50,
    finalTerm: 50,
    project: 20,
    practical: 30,
    total: 100
  };

  // 1️⃣ Validate only keys that actually exist
  for (const [key, value] of Object.entries(subjectData)) {
    if (key === "grade") continue;

    if (value === undefined || value === null || value === "") continue;

    const num = Number(value);
    if (isNaN(num)) {
      errors.push(`${subjectName} - ${key} must be a number`);
      continue;
    }

    if (num < 0) {
      errors.push(`${subjectName} - ${key} cannot be negative`);
    }

    const max = maxByKey[key];
    if (max !== undefined && num > max) {
      errors.push(`${subjectName} - ${key} cannot exceed ${max}`);
    }
  }

  // 2️⃣ TOTAL consistency check (dynamic)
  if ("total" in subjectData) {
    const sum = Object.entries(subjectData)
      .filter(([k]) => k !== "total" && k !== "grade")
      .reduce((acc, [, v]) => acc + (Number(v) || 0), 0);

    if (Math.abs(sum - Number(subjectData.total)) > 0.01) {
      errors.push(
        `${subjectName} - Total (${subjectData.total}) does not match sum (${sum})`
      );
    }
  }

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
    console.log(student);
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

const formatDateDDMMYYYY = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};


const excelDateToJS = (value) => {
  if (value === null || value === undefined || value === "") return "";

  // ✅ If Excel already gave string → KEEP AS IS
  if (typeof value === "string") {
    return value.trim();
  }

  // ✅ If Excel gave Date object
  if (value instanceof Date && !isNaN(value)) {
    return formatDateDDMMYYYY(value);
  }

  // ✅ If Excel serial number
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
    return formatDateDDMMYYYY(jsDate);
  }

  return String(value);
};







export {
  transformDataForBackend,
  calculateGrade,
  calculateResultFromSubjects,
  calculateGrandTotalAndMax,
  extractClassAndSection,
  api,
  buildSubjectMap,
  hasAnyMarks,
  buildColumnSchema,
  formatHeaderLabel,
  validateSubject,
  validateStudent,
  validateAllStudents,
  excelDateToJS
};


const OTP_STORAGE_KEY = "OTP_STORAGE_KEY";
import axios from "axios";




const api = axios.create({
  baseURL: import.meta.env.MODE=="development"?"http://localhost:5000/api":"https://rdjps-resultportal.onrender.com/api",
});



// improved transform - uses tableHeaders + filteredIndices (from handleFileUpload)
const transformDataForBackend = () => {
  // tableHeaders and filteredIndices are from state
  console.log("Using tableHeaders:", tableHeaders);
  console.log("Using filteredIndices:", filteredIndices);
  const transformed = fullRawData.map((row, rowIdx) => {
    // basic fields: try to find common ones in the raw columns by name in tableHeaders
    // build a map headerName => value for this row using filteredIndices
    const rowMap = {};
    tableHeaders.forEach((h, i) => {
      const originalIndex = filteredIndices[i];
      rowMap[h] = row[originalIndex] !== undefined ? row[originalIndex] : "";
    });

    // Expect header names like "Name", "Father Name", or custom - adapt as needed
    const student = {
      name: row[0] || rowMap["name"] || rowMap["Name"] || "",
      fatherName: row[1] || rowMap["fatherName"] || rowMap["Father Name"] || "",
      motherName: row[2] || rowMap["motherName"] || rowMap["Mother Name"] || "",
      examRollNo: row[3] || rowMap["examRollNo"] || rowMap["Exam Roll No"] || "",
      class: row[4] || rowMap["class"] || rowMap["Class"] || "",
      dob: excelDateToJS(row[5] || rowMap["dob"] || rowMap["DOB"] || ""),
      admissionNo: row[6] || rowMap["admissionNo"] || rowMap["Admission No"] || "",
      house: row[7] || rowMap["house"] || rowMap["House"] || "",
      subjects: {},
      overallGrade: rowMap["overallGrade"] || rowMap["Overall Grade"] || null,
      result: rowMap["result"] || null,
      grandTotal: null
    };

    // Build subjects from tableHeaders: headers contain names like "Hindi Total", or "Maths Total".
    // We will detect headers that end with "Total" and then look for related internals/mid/final
    // We'll attempt to find internals/mid/final columns by searching tableHeaders for words.
    const headerLower = tableHeaders.map(h => (h || "").toString().toLowerCase());

    // Example heuristics: if header is "hindi total" or "hindi total" -> subjectName = "hindi"
    headerLower.forEach((h, idx) => {
      if (!h) return;
      if (h.includes(" total")) {
        const orig = tableHeaders[idx];
        // get subject name by removing trailing " Total"
        const subjectName = orig.replace(/[\s]*[Tt]otal$/,'').trim();
        if (!subjectName) return;

        // find internals/mid/final columns for the same subject
        const maybeInternalsIndex = headerLower.findIndex(x => x.includes(subjectName.toLowerCase()) && (x.includes("internal") || x.includes("internals") || x.includes("(20)") || x.includes("internal (20)")));
        const maybeMidIndex = headerLower.findIndex(x => x.includes(subjectName.toLowerCase()) && (x.includes("mid") || x.includes("(30)")));
        const maybeFinalIndex = headerLower.findIndex(x => x.includes(subjectName.toLowerCase()) && (x.includes("final") || x.includes("(50)") || x.includes("end")));

        const totalVal = row[ filteredIndices[idx] ];
        const internalsVal = maybeInternalsIndex === -1 ? null : row[ filteredIndices[maybeInternalsIndex] ];
        const midVal = maybeMidIndex === -1 ? null : row[ filteredIndices[maybeMidIndex] ];
        const finalVal = maybeFinalIndex === -1 ? null : row[ filteredIndices[maybeFinalIndex] ];

        const internalsN = internalsVal === "" || internalsVal == null ? null : parseFloat(internalsVal) || 0;
        const midN = midVal === "" || midVal == null ? null : parseFloat(midVal) || 0;
        const finalN = finalVal === "" || finalVal == null ? null : parseFloat(finalVal) || 0;
        const totalN = totalVal === "" || totalVal == null ? null : parseFloat(totalVal) || 0;

        // store only if there's some data
        if (internalsN !== null || midN !== null || finalN !== null || totalN !== null) {
          student.subjects[subjectName] = {
            internals: internalsN,
            midTerm: midN,
            finalTerm: finalN,
            total: totalN,
            grade: null // if you have a grade column, must find and set similarly
          };
        }
      }
    });

    // try to get grand total (maybe last numeric column in filteredIndices)
    for (let k = filteredIndices.length - 1; k >= 0; k--) {
      const val = row[ filteredIndices[k] ];
      if (val !== null && val !== "" && !isNaN(parseFloat(val))) {
        student.grandTotal = parseFloat(val);
        break;
      }
    }

    return student;
  });

  return transformed;
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
    const response = await fetch('http://localhost:5000/api/auth/check-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
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

const calculateSubjectTotal = (marks) => {
  if (!marks) return 0;

  return (
    (marks.internals || 0) +
    (marks.midTerm || 0) +
    (marks.finalTerm || 0)
  );
};

const calculateGrandTotalAndMax = (subjects = {}) => {
  let grandTotal = 0;
  let subjectCount = 0;

  Object.values(subjects).forEach((marks) => {
    // consider subject only if any marks exist
    const hasAnyMarks =
      marks?.internals ||
      marks?.midTerm ||
      marks?.finalTerm;

    if (hasAnyMarks) {
      subjectCount++;
      grandTotal += calculateSubjectTotal(marks);
    }
  });

  return {
    grandTotal,
    maxTotal: subjectCount * 100
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





export { transformDataForBackend, calculateGrade, calculateResultFromSubjects, calculateGrandTotalAndMax, extractClassAndSection, api };

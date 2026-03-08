const Student = require("../models/Student.js");
const ActivityLogService = require("../services/activityLogService.js");
const classcollection = require("../models/classSchema.js");

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



async function ensureClassAndSection(className, sectionName) {
  if (!className || !sectionName) {
    throw new Error("Class name and section name are required");
  }

  // 1️⃣ Find class
  let classDoc = await classcollection.findOne({ class: className });

  // 2️⃣ If class does NOT exist → create it
  if (!classDoc) {
    classDoc = new classcollection({
      class: className,
      section: [sectionName]
    });

    await classDoc.save();
    return {
      createdClass: true,
      addedSection: true
    };
  }

  // 3️⃣ Class exists → check section
  const sectionExists = classDoc.section.includes(sectionName);

  // 4️⃣ If section does NOT exist → add it
  if (!sectionExists) {
    classDoc.section.push(sectionName);
    await classDoc.save();

    return {
      createdClass: false,
      addedSection: true
    };
  }

  // 5️⃣ Class and section already exist → do nothing
  return {
    createdClass: false,
    addedSection: false
  };
}


const bulkUploadStudents = async (req, res) => {
  try {
    const { classId, students } = req.body;

    console.log(extractClassAndSection(students));
    let { className, section } = extractClassAndSection(students[0].class);

    const resultofclass = await ensureClassAndSection(className, section);
    // console.log("result of class ======", resultofclass);
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No student data provided"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    let inserted = 0;
    let updated = 0;
    for (const incoming of students) {

      // -----------------------------
      // 1️⃣ Find student
      // -----------------------------
      const existingStudent = await Student.findOne({
        examRollNo: Number(incoming.examRollNo),
        class: incoming.class
      });
      // -----------------------------
      // 2️⃣ CREATE NEW STUDENT
      // -----------------------------
      if (!existingStudent) {
        const newStudent = new Student({
          name: incoming.name,
          fatherName: incoming.fatherName,
          motherName: incoming.motherName,
          examRollNo: Number(incoming.examRollNo),
          class: incoming.class,
          email: incoming['email id'] || "",
          phone: incoming['mobile'] || "",
          finalRemark: incoming.finalRemark || "",
          dob: incoming.dob || "",
          admissionNo: Number(incoming.admissionNo),
          activities: incoming.activities || {},
          house: incoming.house,
          subjects: incoming.subjects || {},
          overallGrade: incoming.overallGrade || null,
          result: incoming.result || null,
          attendance: incoming.attendance || null,
          grandTotal: Number(incoming.grandTotal) || 0
        });
        await newStudent.save();
        inserted++;
        continue;
      }

      // -----------------------------
      // 3️⃣ UPDATE EXISTING STUDENT (SMART MERGE)
      // -----------------------------

      // 🔹 Update basic info ONLY if incoming value is meaningful
      const safeUpdateFields = [
        "name",
        "fatherName",
        "motherName",
        "dob",
        "house",
        "finalRemark",
        "attendance"
      ];

      safeUpdateFields.forEach(field => {
        // Only update if incoming has a real value (not empty/null/undefined)
        if (incoming[field] && incoming[field].toString().trim() !== "") {
          existingStudent[field] = incoming[field];
        }
      });

      // 🔹 SUBJECT-LEVEL SMART MERGE
      if (incoming.subjects && typeof incoming.subjects === "object") {
        if (!existingStudent.subjects) {
          existingStudent.subjects = {};
        }

        for (const [subjectName, incomingSubjectData] of Object.entries(incoming.subjects)) {
          const existingSubjectData = existingStudent.subjects[subjectName];

          // ✅ Subject doesn't exist → ADD IT
          if (!existingSubjectData) {
            existingStudent.subjects[subjectName] = incomingSubjectData;
            continue;
          }

          // ✅ Subject exists → MERGE FIELD BY FIELD
          // Only update fields that have meaningful values in incoming data
          const subjectFields = [
            'theory',
            'practical',
            'activity',
            'total',
            'grade',
            'remarks'
          ];

          subjectFields.forEach(field => {
            // Check if incoming subject has this field with a real value
            if (
              incomingSubjectData[field] !== undefined &&
              incomingSubjectData[field] !== null &&
              incomingSubjectData[field] !== ""
            ) {
              // For numeric fields, also check if it's a valid number
              if (['theory', 'practical', 'activity', 'total'].includes(field)) {
                const numValue = Number(incomingSubjectData[field]);
                if (!isNaN(numValue)) {
                  existingStudent.subjects[subjectName][field] = numValue;
                }
              } else {
                // For grade and remarks, directly update
                existingStudent.subjects[subjectName][field] = incomingSubjectData[field];
              }
            }
          });
        }
      }

      // 🔹 Update admissionNo only if provided and valid
      if (incoming.admissionNo !== undefined && !isNaN(incoming.admissionNo)) {
        const admNo = Number(incoming.admissionNo);
        if (admNo > 0) {
          existingStudent.admissionNo = admNo;
        }
      }

      // 🔹 Update overallGrade only if provided and not empty
      if (incoming.overallGrade && incoming.overallGrade.toString().trim() !== "") {
        existingStudent.overallGrade = incoming.overallGrade;
      }

      // 🔹 Update result only if provided and not empty
      if (incoming.result && incoming.result.toString().trim() !== "") {
        existingStudent.result = incoming.result;
      }

      // 🔹 Update grandTotal only if provided and is valid number
      if (incoming.grandTotal !== undefined && !isNaN(incoming.grandTotal)) {
        const total = Number(incoming.grandTotal);
        if (total >= 0) {
          existingStudent.grandTotal = total;
        }
      }

      // Mark subjects as modified for Mongoose
      // 🔹 ACTIVITY SMART MERGE
      if (incoming.activities && typeof incoming.activities === "object") {
        if (!existingStudent.activities) {
          existingStudent.activities = {};
        }

        for (const [activityName, grade] of Object.entries(incoming.activities)) {
          if (grade && grade.toString().trim() !== "") {
            existingStudent.activities[activityName] = grade;
          }
        }

        existingStudent.markModified("activities");
      }


      await existingStudent.save();
      updated++;
    }

    // -----------------------------
    // 4️⃣ ACTIVITY LOG
    // -----------------------------
    await ActivityLogService.logBulkUpload({
      teacherId: req.user.id,
      classId,
      inserted,
      updated
    });

    return res.status(200).json({
      success: true,
      message: "Bulk upload processed successfully",
      inserted,
      updated
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message
    });
  }
};


const getStudentsByClass = async (req, res) => {
  console.log("Fetching students for class:", req.params.classId);
  try {
    const { classId } = req.params;

    const students = await Student.find({ class: classId })
      .sort({ examRollNo: 1 });

    console.log(`Found ${students.length} students for class ${classId}`);

    // ⭐ Fix: subjects is already a plain object, no need to convert
    const formattedStudents = students.map(student => {
      const studentObj = student.toObject();

      // If subjects is a Map, convert it
      if (studentObj.subjects instanceof Map) {
        studentObj.subjects = Object.fromEntries(studentObj.subjects);
      }
      // Otherwise, it's already an object - leave it as is

      return studentObj;
    });
    console.log("erorr")

    return res.status(200).json({
      success: true,
      count: students.length,
      data: formattedStudents
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({ examRollNo: rollNo });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentObj = student.toObject();
    studentObj.subjects = Object.fromEntries(studentObj.subjects);

    res.status(200).json({
      success: true,
      data: studentObj
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};


const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("Updating student:", id);

    // ⭐ Fetch old student data BEFORE update
    const oldStudent = await Student.findById(id).lean();

    if (!oldStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }


    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Perform update
    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    console.log(updateData, "for the windows alert");
    // ⭐ Log the activity
    await ActivityLogService.logMarksUpdate({
      teacherId: req.user.id,
      student
    });


    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await Student.distinct('class');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

module.exports = {
  bulkUploadStudents,
  getStudentsByClass,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  getAllClasses
};


module.exports.getsection = async (req, res) => {
  // console.log("hellow bharat");

  const { classId } = req.params;
  console.log(req.params);
  try {
    const resp = await classcollection.findOne({ class: classId });
    console.log(resp);
    return res.status(200).json({
      success: true,
      message: "Ran correctly",
      data: resp.section
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }


}


module.exports.resetEmailDataForClass = async (req, res) => {
  try {

    const { className, section } = req.params;

    const classId = `${className} ${section}`;

    await Student.updateMany(
      { class: classId },
      {
        $set: {
          emailSent: false,
          emailSentAt: null,
          emailMessageId: null
        }
      }
    );

    res.json({
      success: true,
      message: `Email data reset for class ${classId}`
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to reset email data"
    });
  }
};


module.exports.resetClassData = async (req, res) => {
  try {
    const { className, section } = req.params;

    const classId = `${className} ${section}`;

    // 1️⃣ Delete all students of this class section
    await Student.deleteMany({ class: classId });

    // 2️⃣ Remove the section from class document
    await classcollection.updateOne(
      { class: className },
      {
        $pull: { section: section },
        $set: { Marksverified: false }
      }
    );

    res.json({
      success: true,
      message: `Academic data reset for ${classId}`
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to reset class data"
    });
  }
};
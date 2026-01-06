const ActivityLog = require("../models/ActivityLog");

class ActivityLogService {
  static async logBulkUpload({ teacherId, classId, count }) {
    try {
      await ActivityLog.create({
        teacher: teacherId,
        action: "BULK_UPLOAD",
        entity: "CLASS",
        classId,
        description: `Uploaded ${count} students for class ${classId}`
      });
    } catch (err) {
      console.error("Activity log error:", err.message);
    }
  }

  static async logMarksUpdate({ teacherId, student }) {
    try {
      await ActivityLog.create({
        teacher: teacherId,
        action: "UPDATE_MARKS",
        entity: "STUDENT",
        student: student._id,
        classId: student.class,
        description: `Updated marks for ${student.name} (Roll ${student.examRollNo})`
      });
    } catch (err) {
      console.error("Activity log error:", err.message);
    }
  }
}

module.exports = ActivityLogService;

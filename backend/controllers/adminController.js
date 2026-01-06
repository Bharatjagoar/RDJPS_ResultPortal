const Teacher = require("../models/Teacher");
const ActivityLog = require("../models/ActivityLog");

// 🔍 SEARCH TEACHERS
module.exports.searchTeachers = async (req, res) => {
  try {
    const { q } = req.query;
    console.log(q)
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const teachers = await Teacher.find({
      username: { $regex: q, $options: "i" }
    })
      .select("_id username email")
      .limit(10);

    return res.json({
      success: true,
      data: teachers
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 📜 GET TEACHER ACTIVITIES
module.exports.getTeacherActivities = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await ActivityLog.find({ teacher: teacherId })
      .populate("teacher", "username email")
      .populate("student", "name examRollNo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments({ teacher: teacherId });

    return res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: activities.length,
      data: activities
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const ActivityLog = require("../models/ActivityLog");

const getMyActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ teacher: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity"
    });
  }
};

module.exports = {
  getMyActivity
};

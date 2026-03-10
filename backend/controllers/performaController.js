const Performa = require("../models/Performa");

exports.uploadPerforma = async (req, res) => {
  try {

    const { classId, section } = req.params;
    const { data } = req.body;

    if (!data || !data.length) {
      return res.status(400).json({
        message: "No performa data received"
      });
    }

    for (const subjectBlock of data) {

      const subject = subjectBlock.subject;
      const studentsRaw = subjectBlock.students;

      if (!studentsRaw.length) continue;

      const headers = Object.keys(studentsRaw[0]);

      const students = studentsRaw.map((student) => {

        const rollNo =
          student["Roll No"] ||
          student["Roll"] ||
          student["Exam Roll No"] ||
          "";

        const name =
          student["Name"] ||
          student["Student Name"] ||
          "";

        const marks = {};

        headers.forEach((header) => {
          if (
            header !== "Roll No" &&
            header !== "Roll" &&
            header !== "Exam Roll No" &&
            header !== "Name" &&
            header !== "Student Name"
          ) {
            marks[header] = student[header];
          }
        });

        return {
          rollNo,
          name,
          marks
        };
      });

      await Performa.create({
        classId,
        section,
        subject,
        headers,
        students
      });

    }

    res.status(200).json({
      message: "Performa uploaded successfully"
    });

  } catch (error) {

    console.error("Performa Upload Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};


exports.getPerformaByClassSection = async (req, res) => {
  try {

    const { classId, section } = req.params;

    const performa = await Performa.find({
      classId,
      section
    });

    res.status(200).json(performa);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching performa"
    });

  }
};
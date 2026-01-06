const express = require('express');
const router = express.Router();

const {
  bulkUploadStudents,
  getStudentsByClass,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  getAllClasses,
  getsection
} = require('../controllers/studentController');
const authenticate = require('../middleware/auth.js');

router.post('/bulk',authenticate, bulkUploadStudents);
router.get('/classes/list', getAllClasses);
router.get('/class/:classId', getStudentsByClass);
router.get("/section/:classId",getsection);
router.get('/roll/:rollNo', getStudentByRollNo);
router.put('/:id',authenticate, updateStudent);
router.delete('/:id', deleteStudent);


module.exports = router;
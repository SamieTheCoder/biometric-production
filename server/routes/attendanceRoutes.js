const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/logs', attendanceController.getAttendanceLogs);
router.post('/clear', attendanceController.clearAttendanceLogs);

module.exports = router;

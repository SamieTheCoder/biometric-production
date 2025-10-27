const zkService = require('../services/zkService');
const ResponseHelper = require('../utils/responseHelper');

exports.getAttendanceLogs = async (req, res) => {
  try {
    const { ip, port = 4370 } = req.query;
    
    if (!ip) {
      return ResponseHelper.error(res, 'IP address is required', 400);
    }

    const logs = await zkService.getAttendanceLogs(ip, parseInt(port));
    return ResponseHelper.success(res, logs, 'Attendance logs retrieved successfully');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to get attendance logs', 500, error);
  }
};

exports.clearAttendanceLogs = async (req, res) => {
  try {
    const { ip, port = 4370 } = req.body;
    
    if (!ip) {
      return ResponseHelper.error(res, 'IP address is required', 400);
    }

    const result = await zkService.clearAttendanceLogs(ip, parseInt(port));
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to clear attendance logs', 500, error);
  }
};

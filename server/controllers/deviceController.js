const zkService = require('../services/zkService');
const ResponseHelper = require('../utils/responseHelper');

exports.testConnection = async (req, res) => {
  try {
    const { ip, port = 4370 } = req.body;
    
    if (!ip) {
      return ResponseHelper.error(res, 'IP address is required', 400);
    }

    const result = await zkService.testConnection(ip, parseInt(port));
    
    if (result.success) {
      return ResponseHelper.success(res, result, 'Device connected successfully');
    } else {
      return ResponseHelper.error(res, 'Failed to connect to device', 500, new Error(result.error));
    }
  } catch (error) {
    return ResponseHelper.error(res, 'Connection test failed', 500, error);
  }
};

exports.getDeviceInfo = async (req, res) => {
  try {
    const { ip, port = 4370 } = req.query;
    
    if (!ip) {
      return ResponseHelper.error(res, 'IP address is required', 400);
    }

    const info = await zkService.getDeviceInfo(ip, parseInt(port));
    return ResponseHelper.success(res, info, 'Device info retrieved successfully');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to get device info', 500, error);
  }
};

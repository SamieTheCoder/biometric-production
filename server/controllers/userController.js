const zkService = require('../services/zkService');
const ResponseHelper = require('../utils/responseHelper');

exports.createUser = async (req, res) => {
  try {
    const { ip, port = 4370, userId, name, password, role, cardId } = req.body;
    
    if (!ip || !userId || !name) {
      return ResponseHelper.error(res, 'IP, userId, and name are required', 400);
    }

    const userData = {
      userId: parseInt(userId),
      name: name.toString(),
      password: password || '123456',
      role: role ? parseInt(role) : 0,
      cardId: cardId ? parseInt(cardId) : 0
    };

    const result = await zkService.createUser(ip, parseInt(port), userData);
    return ResponseHelper.success(res, result, result.message, 201);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to create user', 500, error);
  }
};

exports.enrollFingerprint = async (req, res) => {
  try {
    const { ip, port = 4370, userId } = req.body;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const result = await zkService.enrollFingerprint(ip, parseInt(port), parseInt(userId));
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to start fingerprint enrollment', 500, error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { ip, port = 4370 } = req.query;
    
    if (!ip) {
      return ResponseHelper.error(res, 'IP address is required', 400);
    }

    const users = await zkService.getAllUsers(ip, parseInt(port));
    return ResponseHelper.success(res, users, 'Users retrieved successfully');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to get users', 500, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { ip, port = 4370, userId } = req.body;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const result = await zkService.deleteUser(ip, parseInt(port), parseInt(userId));
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to delete user', 500, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { ip, port = 4370, userId, name, password, role, cardId } = req.body;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (cardId !== undefined) updateData.cardId = cardId;

    const result = await zkService.updateUser(ip, parseInt(port), parseInt(userId), updateData);
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to update user', 500, error);
  }
};

exports.enableUser = async (req, res) => {
  try {
    const { ip, port = 4370, userId } = req.body;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const result = await zkService.enableUser(ip, parseInt(port), parseInt(userId));
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to enable user', 500, error);
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { ip, port = 4370, userId } = req.body;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const result = await zkService.disableUser(ip, parseInt(port), parseInt(userId));
    return ResponseHelper.success(res, result, result.message);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to disable user', 500, error);
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const { ip, port = 4370, userId } = req.query;
    
    if (!ip || !userId) {
      return ResponseHelper.error(res, 'IP and userId are required', 400);
    }

    const result = await zkService.getUserStatus(ip, parseInt(port), parseInt(userId));
    return ResponseHelper.success(res, result, 'User status retrieved successfully');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to get user status', 500, error);
  }
};

exports.getDisabledUsers = async (req, res) => {
  try {
    const result = zkService.getDisabledUsers();
    return ResponseHelper.success(res, result, 'Disabled users list retrieved');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to get disabled users', 500, error);
  }
};

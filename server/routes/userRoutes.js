const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create', userController.createUser);
router.post('/enroll-fingerprint', userController.enrollFingerprint);
router.get('/list', userController.getAllUsers);
router.delete('/delete', userController.deleteUser);
router.put('/update', userController.updateUser);
router.post('/enable', userController.enableUser);
router.post('/disable', userController.disableUser);
router.get('/status', userController.getUserStatus);

// NEW: Get list of disabled users
router.get('/disabled', userController.getDisabledUsers);

module.exports = router;

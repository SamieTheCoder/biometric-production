const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/test-connection', deviceController.testConnection);
router.get('/info', deviceController.getDeviceInfo);

module.exports = router;

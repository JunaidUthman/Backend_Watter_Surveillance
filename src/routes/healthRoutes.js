const express = require('express');
const router = express.Router();
const {
    updateSensorStatus,
    updateActuatorStatus,
    getAllSensors,
    getAllActuators
} = require('../controllers/healthController');

// Route for health management
router.get('/sensors', getAllSensors);
router.post('/sensors/health', updateSensorStatus);

router.get('/actuators', getAllActuators);
router.post('/actuators/health', updateActuatorStatus);

module.exports = router;

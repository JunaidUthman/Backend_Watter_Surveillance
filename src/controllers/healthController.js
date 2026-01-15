const Sensor = require('../models/Sensor');
const Actuator = require('../models/Actuator');

// @desc    Update sensor health status
// @route   POST /api/sensors/health
// @access  Public
exports.updateSensorStatus = async (req, res) => {
    try {
        const { name, status } = req.body;

        const sensor = await Sensor.findOneAndUpdate(
            { name: name },
            { status },
            { new: true, runValidators: true }
        );

        if (!sensor) {
            return res.status(404).json({
                success: false,
                error: `Sensor ${name} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: sensor
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update actuator health status
// @route   POST /api/actuators/health
// @access  Public
exports.updateActuatorStatus = async (req, res) => {
    try {
        const { name, status } = req.body;

        const actuator = await Actuator.findOneAndUpdate(
            { name },
            { status },
            { new: true, runValidators: true }
        );

        if (!actuator) {
            return res.status(404).json({
                success: false,
                error: `Actuator ${name} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: actuator
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all sensors
// @route   GET /api/sensors
// @access  Public
exports.getAllSensors = async (req, res) => {
    try {
        const sensors = await Sensor.find();

        res.status(200).json({
            success: true,
            count: sensors.length,
            data: sensors
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all actuators
// @route   GET /api/actuators
// @access  Public
exports.getAllActuators = async (req, res) => {
    try {
        const actuators = await Actuator.find();

        res.status(200).json({
            success: true,
            count: actuators.length,
            data: actuators
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

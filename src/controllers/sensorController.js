const SensorData = require('../models/SensorData');

// @desc    Ingest sensor data from Node-RED
// @route   POST /api/sensors/ingest
// @access  Public
exports.ingestData = async (req, res) => {
    try {
        const { ph, temp, turb, status, pump } = req.body;

        // Map input fields to model fields if they differ
        const newData = new SensorData({
            ph,
            temperature: temp,
            turbidity: turb,
            status,
            pumpState: pump
        });

        const savedData = await newData.save();

        // Emit live data via Socket.io
        // io instance is attached to req.app in server.js
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_sensor_reading', savedData);
            console.log('Live data emitted via WebSockets:', savedData._id);
        }

        res.status(201).json({
            success: true,
            data: savedData
        });
    } catch (err) {
        console.error('Error ingesting data:', err.message);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get last 50 sensor readings for history
// @route   GET /api/sensors/history
// @access  Public
exports.getHistory = async (req, res) => {
    try {
        const history = await SensorData.find()
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

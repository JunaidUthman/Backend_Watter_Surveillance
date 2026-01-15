const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sensor name is required'],
        unique: true,
        trim: true
    },
    functionality: {
        type: String,
        required: [true, 'Functionality is required']
    },
    status: {
        type: String,
        enum: ['working', 'broken'],
        default: 'working'
    }
});

module.exports = mongoose.model('Sensor', SensorSchema);

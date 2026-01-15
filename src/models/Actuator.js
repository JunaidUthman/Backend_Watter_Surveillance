const mongoose = require('mongoose');

const ActuatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Actuator name is required'],
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

module.exports = mongoose.model('Actuator', ActuatorSchema);

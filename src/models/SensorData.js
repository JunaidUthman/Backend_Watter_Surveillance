const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  ph: {
    type: Number,
    required: [true, 'pH value is required']
  },
  temperature: {
    type: Number,
    required: [true, 'Temperature value is required']
  },
  turbidity: {
    type: Number,
    required: [true, 'Turbidity value is required']
  },
  status: {
    type: String,
    enum: ['SAINE', 'POLLUÉE'],
    required: [true, 'Status is required']
  },
  pumpState: {
    type: String,
    enum: ['ON', 'OFF'],
    default: 'OFF'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);

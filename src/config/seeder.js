const Sensor = require('../models/Sensor');
const Actuator = require('../models/Actuator');

const seedData = async () => {
    try {
        const sensorCount = await Sensor.countDocuments();
        const actuatorCount = await Actuator.countDocuments();

        if (sensorCount === 0) {
            const sensors = [
                { name: 'sensor1', functionality: 'ph' },
                { name: 'sensor2', functionality: 'ph' },
                { name: 'sensor3', functionality: 'temperature' },
                { name: 'sensor4', functionality: 'temperature' },
                { name: 'sensor5', functionality: 'turbidity' },
                { name: 'sensor6', functionality: 'turbidity' },
                { name: 'sensor7', functionality: 'tds' },
                { name: 'sensor8', functionality: 'tds' }
            ];
            await Sensor.insertMany(sensors);
            console.log('Sensors seeded successfully');
        }

        if (actuatorCount === 0) {
            const actuators = [
                { name: 'pump1', functionality: 'water_pump' },
                { name: 'pump2', functionality: 'water_pump' }
            ];
            await Actuator.insertMany(actuators);
            console.log('Actuators seeded successfully');
        }
    } catch (err) {
        console.error('Seeding error:', err.message);
    }
};

module.exports = seedData;

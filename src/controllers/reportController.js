const SensorData = require('../models/SensorData');
const Sensor = require('../models/Sensor');
const Actuator = require('../models/Actuator');

exports.getStats = async (req, res) => {
    try {
        const { period, startDate: customStart, endDate: customEnd } = req.query;
        let startDate;
        let endDate = customEnd ? new Date(customEnd) : new Date();

        endDate.setHours(23, 59, 59, 999);

        if (customStart) {
            startDate = new Date(customStart);
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate = new Date();
            if (period === 'week') startDate.setDate(startDate.getDate() - 7);
            else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
            else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
            else startDate.setHours(startDate.getHours() - 24);
        }

        console.log('--- AGGREGATION START ---');
        console.log('Range:', startDate.toISOString(), 'to', endDate.toISOString());

        // FACETED AGGREGATION: Get summary and sampled history in one atomic operation
        const results = await SensorData.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                avgPh: { $avg: '$ph' },
                                avgTemp: { $avg: '$temperature' },
                                avgTurb: { $avg: '$turbidity' },
                                totalReadings: { $sum: 1 },
                                anomalies: {
                                    $sum: { $cond: [{ $eq: ['$status', 'POLLUÉE'] }, 1, 0] }
                                }
                            }
                        }
                    ],
                    history: [
                        { $sort: { timestamp: 1 } },
                        // Limit/Sampling is done in memory if small, or via buckets if large
                        // For now, let's just get the documents directly in the facet
                    ]
                }
            }
        ]);

        const summary = results[0]?.summary[0] || {
            avgPh: 0, avgTemp: 0, avgTurb: 0, totalReadings: 0, anomalies: 0
        };

        let rawHistory = results[0]?.history || [];
        console.log('Faceted results - Total:', summary.totalReadings, 'History Raw:', rawHistory.length);

        // ADAPTIVE SAMPLING & PUMP ACTIVATION COUNTING
        let history = [];
        let pumpActivations = 0;
        let lastPumpState = null;
        const maxPoints = 200;

        // Process raw history for both sampling and activation counting
        rawHistory.forEach((d, index) => {
            // Count total ON occurrences as requested by user
            const currentState = d.pumpState?.toUpperCase();
            if (currentState === 'ON') {
                pumpActivations++;
            }
        });

        if (rawHistory.length <= maxPoints) {
            history = rawHistory.map(d => ({
                timestamp: d.timestamp,
                ph: d.ph,
                temperature: d.temperature,
                turbidity: d.turbidity,
                pumpState: d.pumpState
            }));
        } else {
            // Pick 200 evenly spaced points
            const step = Math.floor(rawHistory.length / maxPoints);
            for (let i = 0; i < rawHistory.length; i += step) {
                if (history.length >= maxPoints) break;
                const d = rawHistory[i];
                history.push({
                    timestamp: d.timestamp,
                    ph: d.ph,
                    temperature: d.temperature,
                    turbidity: d.turbidity,
                    pumpState: d.pumpState
                });
            }
        }

        const sensors = await Sensor.find();
        const actuators = await Actuator.find();

        console.log('Final history count sent:', history.length);
        console.log('--- AGGREGATION END ---');

        res.status(200).json({
            success: true,
            period: period || '24h',
            dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
            data: {
                ...summary,
                avgPh: Number(summary.avgPh?.toFixed(2) || 0),
                avgTemp: Number(summary.avgTemp?.toFixed(2) || 0),
                avgTurb: Number(summary.avgTurb?.toFixed(2) || 0),
                pumpActivations,
                history,
                sensors,
                actuators,
                systemRunningTimeLabel: `${summary.totalReadings} measurements captured`
            }
        });
    } catch (err) {
        console.error('CRITICAL REPORT ERROR:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

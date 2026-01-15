const express = require('express');
const router = express.Router();
const { ingestData, getHistory } = require('../controllers/sensorController');

// Route for Node-RED data ingestion
router.post('/ingest', ingestData);

// Route for Dashboard history
router.get('/history', getHistory);

module.exports = router;

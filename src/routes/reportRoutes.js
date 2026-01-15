const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/reportController');

// Route for statistics report
router.get('/stats', getStats);

module.exports = router;

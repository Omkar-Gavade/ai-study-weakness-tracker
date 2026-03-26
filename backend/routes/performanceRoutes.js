const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzePerformance } = require('../controllers/performanceController');

// POST /api/performance/analyze
router.post('/analyze', protect, analyzePerformance);

module.exports = router;

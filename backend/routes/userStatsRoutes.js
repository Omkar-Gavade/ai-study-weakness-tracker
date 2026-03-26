const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserStats } = require('../controllers/userStatsController');

// GET /api/user/stats
router.get('/stats', protect, getUserStats);

module.exports = router;

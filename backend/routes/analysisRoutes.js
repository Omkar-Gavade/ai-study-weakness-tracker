const express = require('express');
const router = express.Router();
const { getWeaknessReport } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weakness/:userId', protect, getWeaknessReport);

module.exports = router;

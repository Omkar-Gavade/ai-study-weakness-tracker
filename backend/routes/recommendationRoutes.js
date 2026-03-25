const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateRecommendation } = require('../controllers/recommendationController');

router.post('/', protect, generateRecommendation);

module.exports = router;

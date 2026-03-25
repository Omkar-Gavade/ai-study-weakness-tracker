const express = require('express');
const router = express.Router();
const { getWeakTopicsPractice } = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weak/:userId', protect, getWeakTopicsPractice);

module.exports = router;

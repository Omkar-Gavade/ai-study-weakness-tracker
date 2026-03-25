const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, submitQuizAttempt, getDashboardStats, generateQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuiz);
router.get('/dashboard', protect, getDashboardStats);
router.route('/').get(protect, getQuizzes);
router.route('/:id').get(protect, getQuizById);
router.route('/:id/attempt').post(protect, submitQuizAttempt);

module.exports = router;

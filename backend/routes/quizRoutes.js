const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, submitQuizAttempt, getDashboardStats, generateQuiz, generateWeakTopicQuiz, getUserStats } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/generate/weak', protect, generateWeakTopicQuiz);
router.post('/generate', protect, generateQuiz);
router.get('/dashboard', protect, getDashboardStats);
router.get('/stats', protect, getUserStats);
router.route('/').get(protect, getQuizzes);
router.route('/:id').get(protect, getQuizById);
router.route('/:id/attempt').post(protect, submitQuizAttempt);

module.exports = router;

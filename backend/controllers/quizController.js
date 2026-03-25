const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({}).populate('questions');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private
const submitQuizAttempt = async (req, res) => {
    try {
        const { answers } = req.body;
        const quiz = await Quiz.findById(req.params.id).populate('questions');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let correctCount = 0;
        const processedAnswers = answers.map((ans) => {
            const question = quiz.questions.find((q) => q._id.toString() === ans.questionId);
            const isCorrect = question && question.correctAnswer === ans.selectedOption;
            if (isCorrect) correctCount++;
            
            return {
                questionId: ans.questionId,
                selectedOption: ans.selectedOption,
                isCorrect: isCorrect || false
            };
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        const attempt = await QuizAttempt.create({
            user: req.user._id,
            quiz: quiz._id,
            answers: processedAnswers,
            score
        });

        // Update TopicPerformance for Weakness Detection
        const topicUpdates = {};
        for (const ans of processedAnswers) {
            const question = quiz.questions.find((q) => q._id.toString() === ans.questionId);
            if (question && question.topic) {
                if (!topicUpdates[question.topic]) {
                    topicUpdates[question.topic] = { total: 0, correct: 0 };
                }
                topicUpdates[question.topic].total += 1;
                if (ans.isCorrect) {
                    topicUpdates[question.topic].correct += 1;
                }
            }
        }

        const TopicPerformance = require('../models/TopicPerformance');
        let improvementMessages = [];

        for (const [topic, stats] of Object.entries(topicUpdates)) {
            let perf = await TopicPerformance.findOne({ user: req.user._id, topic });
            if (!perf) {
                perf = new TopicPerformance({ user: req.user._id, topic });
            }
            perf.totalQuestions += stats.total;
            perf.correctAnswers += stats.correct;
            
            const previousAccuracy = perf.accuracy || 0;
            perf.accuracy = Math.round((perf.correctAnswers / perf.totalQuestions) * 100);
            
            if (quiz.isWeakPractice && perf.accuracy > previousAccuracy) {
                improvementMessages.push(`You improved in ${topic}!`);
            }

            if (perf.accuracy > 75) {
                perf.weaknessLevel = 'strong';
            } else if (perf.accuracy >= 50) {
                perf.weaknessLevel = 'moderate';
            } else {
                perf.weaknessLevel = 'weak';
            }
            
            perf.history.push({ accuracy: perf.accuracy });
            if (perf.history.length > 20) perf.history.shift(); // Limit History payload
            
            await perf.save();
        }

        res.status(201).json({ attempt, message: improvementMessages.length > 0 ? improvementMessages.join(' ') : null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Dashboard Analytics
// @route   GET /api/quizzes/dashboard 
// Note: Route path changed from /api/dashboard to /api/quizzes/dashboard for simplicity since it's inside quizRoutes
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.user._id })
            .populate({
                path: 'quiz',
                select: 'title'
            })
            .populate({
                path: 'answers.questionId',
                select: 'subject topic difficulty'
            });

        const totalAttempts = attempts.length;
        const avgScore = attempts.length 
            ? attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length 
            : 0;

        // Topic-wise performance
        const topicStats = {};

        attempts.forEach(attempt => {
            attempt.answers.forEach(ans => {
                const topic = ans.questionId?.topic || 'Unknown';
                if (!topicStats[topic]) {
                    topicStats[topic] = { total: 0, correct: 0 };
                }
                topicStats[topic].total += 1;
                if (ans.isCorrect) {
                    topicStats[topic].correct += 1;
                }
            });
        });

        const topicPerformance = Object.keys(topicStats).map(topic => ({
            topic,
            total: topicStats[topic].total,
            correct: topicStats[topic].correct,
            percentage: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100)
        }));

        res.json({
            totalAttempts,
            avgScore: Math.round(avgScore),
            topicPerformance,
            recentAttempts: attempts.slice(-5).reverse()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateQuiz = async (req, res) => {
    try {
        const { subject, topic, difficulty, limit = 10, subsection, testNumber } = req.body;
        
        let questions = [];
        let quizTitle = "Assessment";

        if (subsection && testNumber) {
            // Strict Fixed Series Evaluation
            questions = await Question.find({ subsection, testNumber }).select('_id');
            
            if (questions.length < 30) {
                 return res.status(400).json({ message: `Insufficient Evaluation Criteria! Exactly 30 unique questions natively required per specific Subject Test. Server mapped only ${questions.length}.` });
            }
            
            quizTitle = `${subsection} - Test ${testNumber} (30 Unique Questions)`;
        } else {
            // Generative Mixed Randomizations (for AI Tools & Legacy hooks)
            const matchStage = {};
            if (subject && subject !== 'All') matchStage.subject = subject;
            if (topic && topic !== 'All') matchStage.topic = topic;
            if (difficulty && difficulty !== 'All') matchStage.difficulty = difficulty;

            const aggArray = await Question.aggregate([
                { $match: matchStage },
                { $sample: { size: Number(limit) } }
            ]);
            questions = aggArray.map(q => ({ _id: q._id }));
            quizTitle = `${subject && subject !== 'All' ? subject : (topic && topic !== 'All' ? topic : 'Targeted')} - Assessment`;
        }

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions matching criteria.' });
        }

        const quiz = await Quiz.create({
            title: quizTitle,
            questions: questions.map(q => q._id)
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getQuizzes, getQuizById, submitQuizAttempt, getDashboardStats, generateQuiz };

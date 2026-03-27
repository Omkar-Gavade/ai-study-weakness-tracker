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
        if (req.params.id === 'stats') {
            return getUserStats(req, res);
        }
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
    const query = { subsection, testNumber };
    if (subject && subject !== 'All') query.subject = subject;

    questions = await Question.find(query).select('_id');

    // ✅ FIX START
    if (questions.length < 30) {
        console.log("Using fallback (less questions)");

        const fallback = await Question.aggregate([
            { $sample: { size: 10 } }
        ]);

        questions = fallback.map(q => ({ _id: q._id }));
    }
    // ✅ FIX END

    quizTitle = `${subject ? subject + ' - ' : ''}${subsection} - Test ${testNumber}`;
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

const generateWeakTopicQuiz = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Identify Weak Subjects (Accuracy < 50%)
        const attempts = await QuizAttempt.find({ user: userId })
            .populate('quiz', 'section')
            .select('score quiz');

        const subjectMap = {};
        attempts.forEach(a => {
            const subject = a.quiz?.section || 'इतर';
            if (!subjectMap[subject]) subjectMap[subject] = { total: 0, sum: 0 };
            subjectMap[subject].total++;
            subjectMap[subject].sum += a.score;
        });

        const weakSubjects = Object.entries(subjectMap)
            .filter(([name, s]) => (s.sum / s.total) < 50)
            .map(([name, s]) => name);

        if (weakSubjects.length === 0) {
            return res.status(404).json({ message: 'No weak subjects identified yet! Try taking more tests.' });
        }

        // 2. Fetch 15 random questions from these subjects
        const questions = await Question.aggregate([
            { $match: { section: { $in: weakSubjects } } },
            { $sample: { size: 15 } }
        ]);

        if (questions.length === 0) {
    console.log("No questions found, using fallback");

    const fallback = await Question.aggregate([
        { $sample: { size: 10 } }
    ]);

    questions = fallback.map(q => ({ _id: q._id }));
}

        // 3. Create a temporary quiz
        const quiz = await Quiz.create({
            title: "कमकुवत विषय सराव चाचणी",
            questions: questions.map(q => q._id),
            isWeakPractice: true
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user detailed stats (Summary + Charts)
// @route   GET /api/quizzes/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate quiz.section for subject-wise breakdown
    const attempts = await QuizAttempt
      .find({ user: userId })
      .sort({ createdAt: 1 })
      .populate('quiz', 'section')
      .select('score answers createdAt quiz');

    /* ── Summary stats ─────────────────────────────────────────────────────── */
    const totalTests = attempts.length;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayTests = attempts.filter(a => new Date(a.createdAt) >= todayStart).length;
    const scores = attempts.map(a => a.score);
    const bestScore    = scores.length ? Math.max(...scores) : 0;
    const averageScore = scores.length
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

    /* ── Line chart: score progress over time ───────────────────────────────── */
    const progressData = attempts.slice(-20).map((a, i) => ({
      name: `#${i + 1}`,
      date: new Date(a.createdAt).toLocaleDateString('mr-IN', { month: 'short', day: 'numeric' }),
      score: a.score,
    }));

    /* ── Bar chart: subject-wise average score ──────────────────────────────── */
    const subjectMap = {};
    attempts.forEach(a => {
      const subject = a.quiz?.section || 'इतर';
      if (!subjectMap[subject]) subjectMap[subject] = { total: 0, sum: 0 };
      subjectMap[subject].total++;
      subjectMap[subject].sum += a.score;
    });
    const subjectData = Object.entries(subjectMap).map(([name, s]) => ({
      name,
      score: Math.round(s.sum / s.total),
    }));

    /* ── Pie chart: correct / wrong / skipped across all attempts ───────────── */
    let correct = 0, wrong = 0, skipped = 0;
    attempts.forEach(a => {
      (a.answers || []).forEach(ans => {
        if (!ans.selectedOption) skipped++;
        else if (ans.isCorrect)  correct++;
        else                     wrong++;
      });
    });
    // Fallback when no answer details exist yet
    if (correct + wrong + skipped === 0 && scores.length) {
      correct = bestScore; wrong = 100 - bestScore; skipped = 0;
    }
    const pieData = [
      { name: 'बरोबर',    value: correct,  fill: '#22c55e' },
      { name: 'चुकीचे',   value: wrong,    fill: '#ef4444' },
      { name: 'सोडलेले',  value: skipped,  fill: '#6b7280' },
    ];

    /* ── Weak topics: accuracy < 50% ────────────────────────────────────────── */
    const weakTopics = subjectData.filter(s => s.score < 50).map(s => s.name);

    res.json({ totalTests, todayTests, bestScore, averageScore,
               progressData, subjectData, pieData, weakTopics });
  } catch (err) {
    console.error('getUserStats error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getQuizzes, getQuizById, submitQuizAttempt, getDashboardStats, generateQuiz, generateWeakTopicQuiz, getUserStats };

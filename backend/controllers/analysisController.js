const TopicPerformance = require('../models/TopicPerformance');

// @desc    Get weakness report for a user
// @route   GET /api/analysis/weakness/:userId
// @access  Private
const getWeaknessReport = async (req, res) => {
    try {
        // Query topic performances for the user
        const performances = await TopicPerformance.find({ user: req.params.userId }).sort({ accuracy: 1 });
        
        const report = performances.map(perf => ({
            topic: perf.topic,
            accuracy: perf.accuracy,
            totalAttempts: perf.totalQuestions,
            weaknessLevel: perf.weaknessLevel,
            history: perf.history
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWeaknessReport };

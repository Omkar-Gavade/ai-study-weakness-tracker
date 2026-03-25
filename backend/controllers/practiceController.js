const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const TopicPerformance = require('../models/TopicPerformance');

const getWeakTopicsPractice = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to access these metrics' });
        }

        const weakPerformances = await TopicPerformance.find({ user: userId, accuracy: { $lt: 50 } });
        
        if (!weakPerformances || weakPerformances.length === 0) {
            return res.status(404).json({ message: 'No critical weaknesses identified! You have >50% accuracy across evaluated topics.' });
        }

        const weakTopics = weakPerformances.map(p => p.topic);

        const aggArray = await Question.aggregate([
            { $match: { topic: { $in: weakTopics } } },
            { $sample: { size: 15 } }
        ]);

        if (aggArray.length === 0) {
            return res.status(404).json({ message: 'No questions currently available for your weak topics.' });
        }

        const questions = aggArray.map(q => q._id);

        const quiz = await Quiz.create({
            title: `Weak Topic Practice`,
            questions: questions,
            isWeakPractice: true
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWeakTopicsPractice };

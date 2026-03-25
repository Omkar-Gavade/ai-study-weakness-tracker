const mongoose = require('mongoose');

const topicPerformanceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        totalQuestions: {
            type: Number,
            required: true,
            default: 0,
        },
        correctAnswers: {
            type: Number,
            required: true,
            default: 0,
        },
        accuracy: {
            type: Number,
            required: true,
            default: 0,
        },
        history: [
            {
                date: { type: Date, default: Date.now },
                accuracy: { type: Number, required: true },
            }
        ],
        weaknessLevel: {
            type: String,
            enum: ['strong', 'moderate', 'weak'],
            default: 'moderate'
        }
    },
    {
        timestamps: true,
    }
);

const TopicPerformance = mongoose.model('TopicPerformance', topicPerformanceSchema);
module.exports = TopicPerformance;

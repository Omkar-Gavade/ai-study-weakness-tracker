const mongoose = require('mongoose');

const quizSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
                required: true,
            }
        ],
        isWeakPractice: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;

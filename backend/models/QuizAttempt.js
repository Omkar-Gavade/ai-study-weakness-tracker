const mongoose = require('mongoose');

const quizAttemptSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true,
                },
                selectedOption: {
                    type: String,
                    required: false,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                }
            }
        ],
        score: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;

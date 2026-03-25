const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
            validate: [(val) => val.length >= 2, 'Needs at least two options']
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'],
            default: 'medium',
        },
        section: {
            type: String,
            required: true,
            enum: [
                'Aptitude', 
                'Core Subjects', 
                'Gamified Aptitude',
                'सामान्य अध्ययन',
                'बुद्धिमत्ता चाचणी',
                'स्पर्धा परीक्षा तयारी'
            ]
        },
        subsection: {
            type: String,
            required: true
        },
        companyTag: {
            type: String,
            required: false
        },
        testNumber: {
            type: String,
            required: true
        },
        questionHash: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;

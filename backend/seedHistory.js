const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Question = require('./models/Question');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker';

const seedHistory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    const filePath = path.join(__dirname, 'tmp', 'history_questions.json');
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Read ${questions.length} questions from ${filePath}`);

    let count = 0;
    for (const q of questions) {
        const hash = crypto.createHash('md5').update(q.questionText).digest('hex');
        
        const mappedQuestion = {
            text: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty.toLowerCase(),
            section: 'स्पर्धा परीक्षा तयारी',
            subsection: q.topic,
            testNumber: String(q.testNumber),
            questionHash: hash,
            explanation: q.explanation
        };

        const exists = await Question.findOne({ questionHash: hash });
        if (!exists) {
            await Question.create(mappedQuestion);
            count++;
        }
    }

    console.log(`Seeding completed! Added ${count} new questions.`);
    process.exit();
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedHistory();

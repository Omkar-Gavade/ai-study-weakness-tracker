const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Question = require('../models/Question');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-tracker';

const economicsFiles = [
    { file: 'eco_national_income_1.json', topic: 'भारतीय अर्थव्यवस्था' },
    { file: 'eco_national_income_2.json', topic: 'भारतीय अर्थव्यवस्था' },
    { file: 'eco_banking_1.json', topic: 'बँकिंग व महागाई' },
    { file: 'eco_banking_2.json', topic: 'बँकिंग व महागाई' },
    { file: 'eco_population_1.json', topic: 'लोकसंख्या व दारिद्र्य' },
    { file: 'eco_population_2.json', topic: 'लोकसंख्या व दारिद्र्य' },
    { file: 'eco_finance_1.json', topic: 'सार्वजनिक वित्त व योजना' },
    { file: 'eco_finance_2.json', topic: 'सार्वजनिक वित्त व योजना' }
];

async function seedEconomics() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Economics seeding...');

        let totalProcessed = 0;

        for (const item of economicsFiles) {
            const filePath = path.join(__dirname, '../tmp', item.file);
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }

            const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            for (const q of questions) {
                // Generate a unique hash for each question to prevent duplicates
                const hash = crypto.createHash('md5').update(q.questionText).digest('hex');
                
                const questionData = {
                    text: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    subject: 'अर्थव्यवस्था',
                    topic: q.topic,
                    difficulty: (q.difficulty || 'medium').toLowerCase(),
                    section: 'स्पर्धा परीक्षा तयारी',
                    subsection: item.topic, // This matches what frontend sends (topic.name)
                    testNumber: q.testNumber.toString(),
                    explanation: q.explanation,
                    questionHash: hash
                };

                await Question.updateOne(
                    { questionHash: hash },
                    { $set: questionData },
                    { upsert: true }
                );
                totalProcessed++;
            }
            console.log(`Processed ${item.file} for topic: ${item.topic}`);
        }

        console.log(`Successfully processed ${totalProcessed} Economics questions (upserted).`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedEconomics();

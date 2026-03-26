const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Question = require('../models/Question');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-tracker';

const polityFiles = [
    { file: 'pol_constitution_1.json', topic: 'राज्यघटना' },
    { file: 'pol_constitution_2.json', topic: 'राज्यघटना' },
    { file: 'pol_parliament_1.json', topic: 'संसद व विधिमंडळ' },
    { file: 'pol_parliament_2.json', topic: 'संसद व विधिमंडळ' },
    { file: 'pol_judiciary_1.json', topic: 'न्यायव्यवस्था' },
    { file: 'pol_judiciary_2.json', topic: 'न्यायव्यवस्था' },
    { file: 'pol_local_1.json', topic: 'स्थानिक स्वराज्य' },
    { file: 'pol_local_2.json', topic: 'स्थानिक स्वराज्य' }
];

async function seedPolity() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Polity seeding...');

        let totalProcessed = 0;

        for (const item of polityFiles) {
            const filePath = path.join(__dirname, '../tmp', item.file);
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }

            const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            for (const q of questions) {
                const hash = crypto.createHash('md5').update(q.questionText).digest('hex');
                
                const questionData = {
                    text: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    subject: 'राजशास्त्र',
                    topic: q.topic,
                    difficulty: q.difficulty.toLowerCase(),
                    section: 'स्पर्धा परीक्षा तयारी',
                    subsection: item.topic,
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

        console.log(`Successfully processed ${totalProcessed} Polity questions (upserted).`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedPolity();

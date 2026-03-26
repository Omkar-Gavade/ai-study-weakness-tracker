const mongoose = require('mongoose');
const path = require('path');
const Question = require('../models/Question');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-tracker';

async function verifyPolity() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Polity Data Verification ---');

        const total = await Question.countDocuments({ subject: 'राजशास्त्र' });
        console.log(`Total Polity Questions: ${total}`);

        const topics = ['राज्यघटना', 'संसद व विधिमंडळ', 'न्यायव्यवस्था', 'स्थानिक स्वराज्य'];

        for (const topic of topics) {
            console.log(`\nTopic: ${topic}`);
            for (let testNum = 1; testNum <= 2; testNum++) {
                const count = await Question.countDocuments({ 
                    subject: 'राजशास्त्र', 
                    topic: topic, 
                    testNumber: testNum.toString()
                });
                
                const easy = await Question.countDocuments({ subject: 'राजशास्त्र', topic, testNumber: testNum.toString(), difficulty: 'easy' });
                const medium = await Question.countDocuments({ subject: 'राजशास्त्र', topic, testNumber: testNum.toString(), difficulty: 'medium' });
                const hard = await Question.countDocuments({ subject: 'राजशास्त्र', topic, testNumber: testNum.toString(), difficulty: 'hard' });

                console.log(`  Test ${testNum}: ${count} questions (Easy: ${easy}, Medium: ${medium}, Hard: ${hard})`);
                
                // Content sample
                const sample = await Question.findOne({ subject: 'राजशास्त्र', topic, testNumber: testNum.toString() });
                if (sample) {
                    console.log(`    Sample Q: ${sample.text.substring(0, 50)}...`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyPolity();

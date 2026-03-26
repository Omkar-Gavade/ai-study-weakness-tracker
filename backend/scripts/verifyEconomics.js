const mongoose = require('mongoose');
const path = require('path');
const Question = require('../models/Question');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-tracker';

async function verifyEconomics() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Verification...');

        const subjects = ['अर्थव्यवस्था'];
        const topics = [
            'भारतीय अर्थव्यवस्था',
            'बँकिंग व महागाई',
            'लोकसंख्या व दारिद्र्य',
            'सार्वजनिक वित्त व योजना'
        ];

        for (const sub of subjects) {
            console.log(`\nSubject: ${sub}`);
            for (const top of topics) {
                for (let testNum = 1; testNum <= 2; testNum++) {
                    const count = await Question.countDocuments({
                        subject: sub,
                        subsection: top,
                        testNumber: testNum.toString()
                    });

                    const easy = await Question.countDocuments({ subject: sub, subsection: top, testNumber: testNum.toString(), difficulty: 'easy' });
                    const medium = await Question.countDocuments({ subject: sub, subsection: top, testNumber: testNum.toString(), difficulty: 'medium' });
                    const hard = await Question.countDocuments({ subject: sub, subsection: top, testNumber: testNum.toString(), difficulty: 'hard' });

                    console.log(`- Topic: ${top}, Test: ${testNum} => Total: ${count} (Easy: ${easy}, Med: ${medium}, Hard: ${hard})`);
                }
            }
        }

        const total = await Question.countDocuments({ subject: 'अर्थव्यवस्था' });
        console.log(`\nTotal Economics Questions in DB: ${total}`);

        if (total === 240) {
            console.log('✅ Verification Successful: All 240 questions are present.');
        } else {
            console.log(`❌ Verification Failed: Found ${total} questions, expected 240.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyEconomics();

const mongoose = require('mongoose');
const Question = require('../models/Question');

const mongoURI = 'mongodb://localhost:27017/ai-study-tracker';

async function verifyEnvironment() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    const subjects = ['पर्यावरण'];
    const topics = ['पर्यावरण शास्त्र', 'जैवविविधता', 'हवामान बदल', 'प्रदूषण'];

    for (const subject of subjects) {
      for (const topic of topics) {
        for (let testNum = 1; testNum <= 2; testNum++) {
          const count = await Question.countDocuments({
            subject: subject,
            subsection: topic, // Now using Marathi name
            testNumber: testNum.toString(),
            section: 'स्पर्धा परीक्षा तयारी'
          });

          console.log(`${topic} - Test ${testNum}: ${count} questions`);
        }
      }
    }

    const totalCount = await Question.countDocuments({ subject: 'पर्यावरण', section: 'स्पर्धा परीक्षा तयारी' });
    console.log(`\nTotal Environment Questions: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error verifying environment data:', err);
    process.exit(1);
  }
}

verifyEnvironment();
